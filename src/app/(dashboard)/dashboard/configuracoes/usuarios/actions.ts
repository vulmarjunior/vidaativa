"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { APP_ROLES } from "@/lib/users/types";

const role = z.enum(APP_ROLES);
const userPayload = z.object({
  fullName: z.string().trim().min(2).max(160),
  professionalId: z.union([z.literal(""), z.string().uuid()]),
  roles: z.array(role).min(1),
});

async function requireAdmin() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");
  const { data: adminRole } = await supabase.from("profile_roles").select("role").eq("user_id", authData.user.id).eq("role", "admin").eq("active", true).maybeSingle();
  if (!adminRole) redirect("/dashboard/configuracoes/usuarios?status=forbidden");
  return { supabase, actorId: authData.user.id };
}

function finish(status: "saved" | "invited" | "invalid" | "error" | "forbidden", message?: string): never {
  revalidatePath("/dashboard/configuracoes/usuarios");
  const params = new URLSearchParams({ status });
  if (message) params.set("message", message.slice(0, 180));
  redirect(`/dashboard/configuracoes/usuarios?${params}`);
}

export async function inviteUser(formData: FormData) {
  const parsed = userPayload.extend({ email: z.string().trim().toLowerCase().email() }).safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    professionalId: formData.get("professionalId") ?? "",
    roles: formData.getAll("roles"),
  });
  if (!parsed.success) finish("invalid");
  const { supabase } = await requireAdmin();
  const origin = (await headers()).get("origin");
  const { error } = await supabase.functions.invoke("admin-users", { body: {
    action: "invite",
    ...parsed.data,
    professionalId: parsed.data.professionalId || null,
    redirectTo: origin ? `${origin}/auth/set-password` : undefined,
  } });
  finish(error ? "error" : "invited", error?.message);
}

export async function updateUserAccess(formData: FormData) {
  const parsed = userPayload.extend({ userId: z.string().uuid(), active: z.boolean() }).safeParse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName"),
    professionalId: formData.get("professionalId") ?? "",
    roles: formData.getAll("roles"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) finish("invalid");
  const { supabase, actorId } = await requireAdmin();
  if (parsed.data.userId === actorId && (!parsed.data.active || !parsed.data.roles.includes("admin"))) finish("invalid", "Seu próprio acesso administrativo deve permanecer ativo.");
  const { error } = await supabase.functions.invoke("admin-users", { body: {
    action: "update",
    ...parsed.data,
    professionalId: parsed.data.professionalId || null,
  } });
  finish(error ? "error" : "saved", error?.message);
}
