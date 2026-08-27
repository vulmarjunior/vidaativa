import Link from "next/link";
import { ClinicBrand } from "@/components/brand/clinic-brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getClinicSettings } from "@/lib/clinic/queries";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const clinic = await getClinicSettings();
  return <main className="grid min-h-screen place-items-center px-6 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-8 block w-fit"><ClinicBrand clinic={clinic} /></Link><Card><CardHeader><CardTitle>Recuperar acesso</CardTitle><CardDescription>Informe o mesmo e-mail usado no convite. Enviaremos um link para você definir uma nova senha.</CardDescription></CardHeader><CardContent><ForgotPasswordForm /></CardContent></Card></div></main>;
}
