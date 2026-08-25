import Link from "next/link";
import { ClinicBrand } from "@/components/brand/clinic-brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getClinicSettings } from "@/lib/clinic/queries";
import { LoginForm } from "./login-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const clinic = await getClinicSettings();
  const { status } = await searchParams;
  return <main className="grid min-h-screen place-items-center px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-8 block w-fit"><ClinicBrand clinic={clinic} /></Link><Card className="shadow-xl shadow-primary/8"><CardHeader><CardTitle>Acesso ao sistema</CardTitle><CardDescription>Entre com sua conta individual. Todas as ações relevantes são auditadas.</CardDescription></CardHeader><CardContent className="space-y-5">{status === "password-created" && <Alert><AlertDescription>Senha definida. Entre com sua nova credencial.</AlertDescription></Alert>}{status === "invite-invalid" && <Alert variant="destructive"><AlertDescription>O convite é inválido ou expirou. Solicite um novo envio.</AlertDescription></Alert>}{status === "inactive" && <Alert variant="destructive"><AlertDescription>Esta conta está inativa. Procure o administrador.</AlertDescription></Alert>}<LoginForm enabled={hasSupabaseEnv()} /></CardContent></Card></div></main>;
}
