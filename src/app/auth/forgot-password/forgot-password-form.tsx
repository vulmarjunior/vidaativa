"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim().toLowerCase();
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/recovery`,
    });

    if (resetError?.code === "over_email_send_rate_limit" || resetError?.code === "over_request_rate_limit") {
      setError("Muitas solicitações foram realizadas. Aguarde alguns minutos e tente novamente.");
      setPending(false);
      return;
    }

    // A resposta é deliberadamente genérica para não revelar se o e-mail existe.
    setSent(true);
    setPending(false);
  }

  if (sent) {
    return <div className="space-y-5"><Alert><AlertDescription>Se o e-mail estiver cadastrado, você receberá um link para definir uma nova senha. Verifique também a pasta de spam.</AlertDescription></Alert><Button asChild variant="outline" className="w-full"><Link href="/login">Voltar ao login</Link></Button></div>;
  }

  return <form onSubmit={submit} className="space-y-5">{error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}<div className="space-y-2"><Label htmlFor="recovery-email">E-mail da conta</Label><Input id="recovery-email" name="email" type="email" autoComplete="email" placeholder="seu@email.com" disabled={pending} required /></div><Button className="w-full" size="lg" disabled={pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}Enviar link de recuperação</Button><Button asChild variant="ghost" className="w-full"><Link href="/login">Voltar ao login</Link></Button></form>;
}
