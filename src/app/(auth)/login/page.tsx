import Link from "next/link";
import { ClinicBrand } from "@/components/brand/clinic-brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getClinicSettings } from "@/lib/clinic/queries";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const clinic = await getClinicSettings();
  return <main className="grid min-h-screen place-items-center px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-8 block w-fit"><ClinicBrand clinic={clinic} /></Link><Card className="shadow-xl shadow-primary/8"><CardHeader><CardTitle>Acesso ao sistema</CardTitle><CardDescription>Entre com sua conta individual. Todas as ações relevantes são auditadas.</CardDescription></CardHeader><CardContent><LoginForm enabled={hasSupabaseEnv()} /></CardContent></Card></div></main>;
}
