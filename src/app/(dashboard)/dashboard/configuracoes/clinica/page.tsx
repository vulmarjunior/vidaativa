import { Building2, ImageIcon, Palette } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClinicSettings } from "@/lib/clinic/queries";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { updateClinicSettings } from "./actions";

export default async function ClinicSettingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const enabled = hasSupabaseEnv();
  const clinic = await getClinicSettings();
  const { status } = await searchParams;
  return <div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-sm font-medium text-primary">Configurações</p><h1 className="text-3xl font-semibold tracking-tight">Dados da clínica</h1><p className="mt-1 text-muted-foreground">Identidade, contatos e informações institucionais utilizadas pelo site e documentos.</p></div>
    {!enabled && <Alert><Building2 className="size-4" /><AlertTitle>Modo de prévia</AlertTitle><AlertDescription>Conecte o Supabase para carregar e salvar estes dados no banco.</AlertDescription></Alert>}
    {status === "saved" && <Alert><Building2 className="size-4" /><AlertTitle>Dados atualizados</AlertTitle><AlertDescription>A identidade da clínica foi salva e já pode ser utilizada pelo sistema.</AlertDescription></Alert>}
    {status === "invalid" && <Alert variant="destructive"><AlertTitle>Dados inválidos</AlertTitle><AlertDescription>Revise os campos obrigatórios e tente novamente.</AlertDescription></Alert>}
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2"><CardHeader><CardTitle>Identificação</CardTitle><CardDescription>Estes valores são persistidos no banco, não fixados no código.</CardDescription></CardHeader><CardContent><form action={updateClinicSettings} className="grid gap-5 sm:grid-cols-2"><Field name="tradeName" label="Nome fantasia" value={clinic.tradeName} /><Field name="legalName" label="Razão social" value={clinic.legalName} /><Field name="cnpj" label="CNPJ" value={clinic.cnpj ?? ""} /><Field name="email" label="E-mail" value={clinic.email ?? ""} type="email" /><Field name="phone" label="Telefone" value={clinic.phone ?? ""} /><Field name="whatsapp" label="WhatsApp" value={clinic.whatsapp ?? ""} /><Field name="street" label="Logradouro" value={clinic.street ?? ""} /><Field name="number" label="Número" value={clinic.number ?? ""} /><Field name="complement" label="Complemento" value={clinic.complement ?? ""} /><Field name="district" label="Bairro" value={clinic.district ?? ""} /><Field name="city" label="Cidade" value={clinic.city ?? ""} /><Field name="state" label="UF" value={clinic.state ?? ""} /><Field name="postalCode" label="CEP" value={clinic.postalCode ?? ""} /><Field name="primaryColor" label="Cor da medicina" value={clinic.primaryColor} type="color" /><Field name="secondaryColor" label="Cor da fisioterapia" value={clinic.secondaryColor} type="color" /><div className="sm:col-span-2"><Button disabled={!enabled}>Salvar alterações</Button></div></form></CardContent></Card>
      <div className="space-y-5"><Card><CardHeader><ImageIcon className="size-5 text-primary" /><CardTitle>Logotipo</CardTitle><CardDescription>O envio será habilitado após a conexão ao Storage.</CardDescription></CardHeader><CardContent><Button variant="outline" className="w-full" disabled>Selecionar arquivo</Button></CardContent></Card><Card><CardHeader><Palette className="size-5 text-secondary-foreground" /><CardTitle>Cores institucionais</CardTitle><CardDescription>Azul para medicina e verde-água para fisioterapia.</CardDescription></CardHeader><CardContent className="space-y-3"><ColorSample label="Medicina" color={clinic.primaryColor} /><ColorSample label="Fisioterapia" color={clinic.secondaryColor} /></CardContent></Card></div>
    </div>
  </div>;
}

function Field({ name, label, value, type = "text" }: { name: string; label: string; value: string; type?: string }) {
  return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type={type} defaultValue={value} /></div>;
}
function ColorSample({ label, color }: { label: string; color: string }) {
  return <div className="flex items-center justify-between rounded-lg border p-3 text-sm"><span>{label}</span><span className="flex items-center gap-2 font-mono text-xs"><span className="size-5 rounded-full border" style={{ backgroundColor: color }} />{color}</span></div>;
}
