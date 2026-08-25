import { ShieldCheck, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserAdministrationData } from "@/lib/users/queries";
import { inviteUser } from "./actions";
import { ProfessionalSelect, RoleSelector, UsersDirectory } from "./users-administration";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ status?: string; message?: string }> }) {
  const [data, params] = await Promise.all([getUserAdministrationData(), searchParams]);
  return <div className="mx-auto max-w-7xl space-y-6">
    <div><p className="text-sm font-medium text-primary">Configurações de acesso</p><h1 className="text-3xl font-semibold tracking-tight">Usuários e papéis</h1><p className="mt-1 text-muted-foreground">Contas individuais, vínculos profissionais e permissões acumuláveis.</p></div>
    {params.status === "invited" && <Alert><UserPlus /><AlertTitle>Convite enviado</AlertTitle><AlertDescription>O usuário receberá um link para confirmar a conta e definir a própria senha.</AlertDescription></Alert>}
    {params.status === "saved" && <Alert><ShieldCheck /><AlertTitle>Usuário atualizado</AlertTitle><AlertDescription>As alterações foram salvas e registradas na auditoria.</AlertDescription></Alert>}
    {params.status === "cancelled" && <Alert><ShieldCheck /><AlertTitle>Convite cancelado</AlertTitle><AlertDescription>A conta pendente e seus vínculos provisórios foram removidos, e a ação foi auditada.</AlertDescription></Alert>}
    {params.status === "invalid" && <Alert variant="destructive"><AlertTitle>Dados inválidos</AlertTitle><AlertDescription>{params.message ?? "Informe nome e ao menos um papel."}</AlertDescription></Alert>}
    {(params.status === "error" || params.status === "forbidden" || data.error) && <Alert variant="destructive"><AlertTitle>Administração indisponível</AlertTitle><AlertDescription>{params.message ?? data.error ?? "A operação não pôde ser concluída."}</AlertDescription></Alert>}

    {data.canManage && <Card><CardHeader><CardTitle className="flex items-center gap-2"><UserPlus className="size-5 text-primary" />Convidar usuário</CardTitle><CardDescription>O convite é enviado pelo Supabase Auth. Não crie ou compartilhe senhas temporárias.</CardDescription></CardHeader><CardContent><form action={inviteUser} className="grid gap-5 lg:grid-cols-3"><Field id="invite-full-name" name="fullName" label="Nome completo" required /><Field id="invite-email" name="email" label="E-mail individual" type="email" required /><ProfessionalSelect id="invite-professional" professionals={data.professionals} /><div className="lg:col-span-3"><RoleSelector selected={["reception"]} namePrefix="invite" /></div><div className="lg:col-span-3"><Button><UserPlus />Enviar convite</Button></div></form></CardContent></Card>}

    {data.canManage && <UsersDirectory users={data.users} professionals={data.professionals} currentUserId={data.currentUserId} />}
  </div>;
}

function Field({ id, name, label, type = "text", required }: { id: string; name: string; label: string; type?: string; required?: boolean }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} name={name} type={type} required={required} /></div>;
}
