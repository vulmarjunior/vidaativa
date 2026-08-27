"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  // A política de tamanho é aplicada ao criar ou trocar a senha. No login,
  // bloquear senhas legadas antes de consultar o Auth impede contas válidas.
  password: z.string().min(1, "Informe sua senha."),
});
export type LoginState = { error?: string };

function getLoginErrorMessage(code?: string) {
  switch (code) {
    case "email_not_confirmed":
      return "Seu e-mail ainda não foi confirmado. Abra o convite recebido ou solicite um novo envio.";
    case "user_banned":
      return "Esta conta está inativa. Procure o administrador.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.";
    case "weak_password":
      return "Sua senha precisa ser atualizada para atender à política de segurança. Solicite a redefinição ao administrador.";
    default:
      return "Não foi possível entrar. Confira o e-mail e a senha.";
  }
}

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: getLoginErrorMessage(error.code) };
  redirect("/dashboard");
}
