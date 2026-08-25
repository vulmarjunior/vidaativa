import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { ManagedUser, UserAdministrationData } from "./types";

const empty: UserAdministrationData = { currentUserId: null, canManage: false, users: [], professionals: [], error: null };

export async function getUserAdministrationData(): Promise<UserAdministrationData> {
  if (!hasSupabaseEnv()) return { ...empty, error: "Supabase não configurado." };
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { ...empty, error: "Sessão não autenticada." };
  const { data: adminRole } = await supabase.from("profile_roles").select("role").eq("user_id", authData.user.id).eq("role", "admin").eq("active", true).maybeSingle();
  if (!adminRole) return { ...empty, currentUserId: authData.user.id, error: "Acesso restrito ao administrador técnico." };

  const [functionResult, professionals] = await Promise.all([
    supabase.functions.invoke<{ users: ManagedUser[] }>("admin-users", { body: { action: "list" } }),
    supabase.from("professionals").select("id,full_name,active").order("full_name"),
  ]);
  if (functionResult.error || professionals.error) {
    return { ...empty, currentUserId: authData.user.id, canManage: true, error: "Não foi possível carregar a administração de usuários." };
  }
  return {
    currentUserId: authData.user.id,
    canManage: true,
    users: functionResult.data?.users ?? [],
    professionals: (professionals.data ?? []).map((item) => ({ id: item.id, name: item.full_name, active: item.active })),
    error: null,
  };
}
