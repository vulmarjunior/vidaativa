import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { APP_ROLES, type AppRole } from "@/lib/users/types";

export type CurrentAccess = { userId: string; roles: AppRole[] };

export const getCurrentAccess = cache(async (): Promise<CurrentAccess> => {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");
  const [{ data: profile }, { data: assignedRoles }] = await Promise.all([
    supabase.from("profiles").select("active").eq("user_id", authData.user.id).maybeSingle<{ active: boolean }>(),
    supabase.from("profile_roles").select("role").eq("user_id", authData.user.id).eq("active", true),
  ]);
  if (!profile?.active) redirect("/login?status=inactive");
  const validRoles = new Set<string>(APP_ROLES);
  const roles = (assignedRoles ?? []).map((item) => item.role).filter((role): role is AppRole => validRoles.has(role));
  return { userId: authData.user.id, roles };
});
