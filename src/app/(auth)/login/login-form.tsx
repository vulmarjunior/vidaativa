"use client";
import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { login } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(login, {});
  return <form action={action} className="space-y-5">{!enabled && <Alert><AlertDescription>Configure o Supabase no arquivo <code>.env.local</code> para habilitar o acesso.</AlertDescription></Alert>}{state.error && <Alert variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert>}<div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="email" placeholder="seu@email.com" disabled={!enabled || pending} required /></div><div className="space-y-2"><Label htmlFor="password">Senha</Label><Input id="password" name="password" type="password" autoComplete="current-password" disabled={!enabled || pending} required /></div><Button className="w-full" size="lg" disabled={!enabled || pending}>{pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} Entrar</Button></form>;
}
