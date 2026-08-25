"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setReady(Boolean(data.user)));
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
      setError("Não foi possível definir a senha. Solicite um novo convite.");
      setPending(false);
      return;
    }
    await supabase.auth.signOut();
    router.push("/login?status=password-created");
    router.refresh();
  }

  return <form onSubmit={submit} className="space-y-5">
    {!ready && <Alert><AlertDescription>Validando o convite. Se esta mensagem permanecer, o link pode ter expirado.</AlertDescription></Alert>}
    {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    <div className="space-y-2"><Label htmlFor="password">Nova senha</Label><Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={!ready || pending} /></div>
    <div className="space-y-2"><Label htmlFor="confirmation">Confirmar senha</Label><Input id="confirmation" name="confirmation" type="password" autoComplete="new-password" minLength={8} required disabled={!ready || pending} /></div>
    <Button className="w-full" size="lg" disabled={!ready || pending}>{pending ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Definir senha</Button>
  </form>;
}
