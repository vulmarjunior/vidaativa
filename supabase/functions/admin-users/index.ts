import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const roles = ["admin", "direction", "reception", "billing", "doctor", "physiotherapist", "movement_professional", "support"] as const;
type AppRole = typeof roles[number];
type RequestBody = {
  action?: "list" | "invite" | "update" | "cancel_invite";
  userId?: string;
  email?: string;
  fullName?: string;
  active?: boolean;
  professionalId?: string | null;
  roles?: AppRole[];
  redirectTo?: string;
};

const handler = {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const { data: actorData, error: actorError } = await ctx.supabase.auth.getUser();
    const actorId = actorData.user?.id;
    if (actorError || !actorId) return Response.json({ error: "Sessão inválida." }, { status: 401 });

    const { data: adminRole } = await ctx.supabase
      .from("profile_roles")
      .select("role")
      .eq("user_id", actorId)
      .eq("role", "admin")
      .eq("active", true)
      .maybeSingle();
    if (!adminRole) return Response.json({ error: "Acesso restrito ao administrador." }, { status: 403 });

    const body = await req.json() as RequestBody;
    if (body.action === "list") {
      const [{ data: authData, error: authError }, profiles, assignments] = await Promise.all([
        ctx.supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
        ctx.supabase.from("profiles").select("user_id,full_name,active,professional_id"),
        ctx.supabase.from("profile_roles").select("user_id,role,active"),
      ]);
      if (authError || profiles.error || assignments.error) {
        return Response.json({ error: "Não foi possível carregar os usuários." }, { status: 500 });
      }
      const profileMap = new Map((profiles.data ?? []).map((profile) => [profile.user_id, profile]));
      const roleMap = new Map<string, AppRole[]>();
      for (const assignment of assignments.data ?? []) {
        if (!assignment.active) continue;
        const current = roleMap.get(assignment.user_id) ?? [];
        current.push(assignment.role as AppRole);
        roleMap.set(assignment.user_id, current);
      }
      return Response.json({ users: (authData.users ?? []).map((user) => {
        const profile = profileMap.get(user.id);
        return {
          id: user.id,
          email: user.email ?? "",
          fullName: profile?.full_name ?? String(user.user_metadata?.full_name ?? ""),
          active: profile?.active ?? false,
          professionalId: profile?.professional_id ?? null,
          roles: roleMap.get(user.id) ?? [],
          emailConfirmedAt: user.email_confirmed_at ?? null,
          lastSignInAt: user.last_sign_in_at ?? null,
          bannedUntil: user.banned_until ?? null,
        };
      }) });
    }

    if (body.action === "cancel_invite" && body.userId) {
      if (body.userId === actorId) {
        return Response.json({ error: "Você não pode cancelar o próprio acesso." }, { status: 400 });
      }
      const { data: targetData, error: targetError } = await ctx.supabaseAdmin.auth.admin.getUserById(body.userId);
      const target = targetData.user;
      if (targetError || !target) return Response.json({ error: "Convite não encontrado." }, { status: 404 });
      if (target.email_confirmed_at || target.last_sign_in_at) {
        return Response.json({ error: "Contas confirmadas devem ser inativadas, não excluídas." }, { status: 400 });
      }

      const { error: auditError } = await ctx.supabaseAdmin.from("audit_events").insert({
        actor_id: actorId,
        action: "cancel_invite",
        entity_type: "auth_user",
        entity_id: body.userId,
        metadata: { reason: "pending_invitation_cancelled" },
      });
      if (auditError) return Response.json({ error: "Não foi possível registrar o cancelamento na auditoria." }, { status: 500 });

      const { error: rolesError } = await ctx.supabaseAdmin.from("profile_roles").delete().eq("user_id", body.userId);
      if (rolesError) return Response.json({ error: "Não foi possível remover os papéis provisórios." }, { status: 500 });
      const { error: profileError } = await ctx.supabaseAdmin.from("profiles").delete().eq("user_id", body.userId);
      if (profileError) return Response.json({ error: "Não foi possível remover o perfil provisório." }, { status: 500 });
      const { error: deleteError } = await ctx.supabaseAdmin.auth.admin.deleteUser(body.userId);
      if (deleteError) return Response.json({ error: "O perfil provisório foi removido, mas o convite precisa ser conferido no Auth." }, { status: 500 });
      return Response.json({ ok: true });
    }

    const selectedRoles = [...new Set(body.roles ?? [])].filter((role): role is AppRole => roles.includes(role));
    const fullName = body.fullName?.trim() ?? "";
    if (fullName.length < 2 || selectedRoles.length === 0) {
      return Response.json({ error: "Nome e ao menos um papel são obrigatórios." }, { status: 400 });
    }

    if (body.action === "invite") {
      const email = body.email?.trim().toLowerCase() ?? "";
      if (!email.includes("@")) return Response.json({ error: "E-mail inválido." }, { status: 400 });
      const { data: invited, error: inviteError } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName },
        redirectTo: body.redirectTo,
      });
      if (inviteError || !invited.user) {
        return Response.json({ error: inviteError?.message ?? "Não foi possível enviar o convite." }, { status: 400 });
      }
      const { error: profileError } = await ctx.supabase.from("profiles").insert({
        user_id: invited.user.id,
        full_name: fullName,
        role: selectedRoles[0],
        active: true,
        professional_id: body.professionalId || null,
      });
      if (profileError) {
        await ctx.supabaseAdmin.auth.admin.deleteUser(invited.user.id);
        return Response.json({ error: "O convite foi revertido porque o perfil não pôde ser criado." }, { status: 500 });
      }
      if (selectedRoles.length > 1) {
        const { error: rolesError } = await ctx.supabase.from("profile_roles").upsert(
          selectedRoles.slice(1).map((role) => ({ user_id: invited.user.id, role, active: true })),
          { onConflict: "user_id,role" },
        );
        if (rolesError) return Response.json({ error: "Convite enviado, mas alguns papéis não foram atribuídos." }, { status: 500 });
      }
      return Response.json({ ok: true });
    }

    if (body.action === "update" && body.userId) {
      if (body.userId === actorId && (body.active === false || !selectedRoles.includes("admin"))) {
        return Response.json({ error: "Você não pode remover seu próprio acesso administrativo." }, { status: 400 });
      }
      const active = body.active !== false;
      const { error: authError } = await ctx.supabaseAdmin.auth.admin.updateUserById(body.userId, {
        ban_duration: active ? "none" : "876000h",
        user_metadata: { full_name: fullName },
      });
      if (authError) return Response.json({ error: "Não foi possível atualizar o acesso no Auth." }, { status: 500 });
      const { error: profileError } = await ctx.supabase.from("profiles").update({
        full_name: fullName,
        active,
        professional_id: body.professionalId || null,
      }).eq("user_id", body.userId);
      if (profileError) {
        await ctx.supabaseAdmin.auth.admin.updateUserById(body.userId, { ban_duration: active ? "876000h" : "none" });
        return Response.json({ error: profileError.message }, { status: 400 });
      }
      const { error: roleError } = await ctx.supabase.from("profile_roles").upsert(
        roles.map((role) => ({ user_id: body.userId, role, active: selectedRoles.includes(role) })),
        { onConflict: "user_id,role" },
      );
      if (roleError) return Response.json({ error: roleError.message }, { status: 400 });
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Operação inválida." }, { status: 400 });
  }),
};

export default handler;
