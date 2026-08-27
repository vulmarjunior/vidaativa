import Link from "next/link";
import { redirect } from "next/navigation";
import { ClinicBrand } from "@/components/brand/clinic-brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClinicSettings } from "@/lib/clinic/queries";
import { SetPasswordForm } from "./set-password-form";

export default async function SetPasswordPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  if (code) redirect(`/auth/recovery?code=${encodeURIComponent(code)}`);
  const clinic = await getClinicSettings();
  return <main className="grid min-h-screen place-items-center px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-8 block w-fit"><ClinicBrand clinic={clinic} /></Link><Card><CardHeader><CardTitle>Defina sua senha</CardTitle><CardDescription>Conclua o convite usando uma senha individual. Não compartilhe suas credenciais.</CardDescription></CardHeader><CardContent><SetPasswordForm /></CardContent></Card></div></main>;
}
