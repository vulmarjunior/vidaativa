"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function getPasswordUpdateErrorMessage(code?: string) {
  switch (code) {
    case "same_password":
      return "A nova senha deve ser diferente da senha atual e das utilizadas anteriormente.";
    case "weak_password":
      return "A senha não atende à política de segurança. Use uma senha diferente, com maiúscula, minúscula, número e símbolo.";
    case "reauthentication_needed":
    case "reauthentication_not_valid":
      return "A confirmação de segurança não é mais válida. Solicite um novo link de recuperação.";
    case "session_not_found":
    case "refresh_token_not_found":
    case "refresh_token_already_used":
      return "Sua sessão de recuperação expirou. Solicite um novo link.";
    case "user_banned":
      return "Esta conta está inativa. Procure o administrador.";
    case "over_request_rate_limit":
      return "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.";
    default:
      return code
        ? `Não foi possível definir a senha. Código de autenticação: ${code}.`
        : "Não foi possível definir a senha. Solicite um novo link de recuperação.";
  }
}

export function SetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function validateRecoverySession() {
      const { data, error: userError } = await supabase.auth.getUser();
      if (!active) return;
      if (userError || !data.user) {
        setError("Não foi possível validar sua sessão. Solicite um novo link de recuperação.");
        setReady(false);
        return;
      }
      setReady(true);
    }

    void validateRecoverySession();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (password.length < 8 || password !== confirmation) {
      setError(password.length < 8 ? "A senha deve ter ao menos 8 caracteres." : "As senhas não coincidem.");
      setPending(false);
      return;
    }
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(getPasswordUpdateErrorMessage(updateError.code));
      setPending(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/login?status=password-created");
    router.refresh();
  }

  return <form onSubmit={submit} className="space-y-5">
    {!ready && !error && <Alert><AlertDescription>Validando seu link de acesso. Aguarde um instante.</AlertDescription></Alert>}
    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    <div className="space-y-2"><Label htmlFor="password">Nova senha</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={!ready || pending} /></div>
    <div className="space-y-2"><Label htmlFor="confirmation">Confirmar senha</Label><Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} required disabled={!ready || pending} /></div>
    <Button className="w-full" size="lg" disabled={!ready || pending}>{pending ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Definir senha</Button>
  </form>;
}
