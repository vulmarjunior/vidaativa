import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { navigationForRoles } from "@/components/dashboard/navigation";
import { getCurrentAccess } from "@/lib/auth/access";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { ROLE_LABELS } from "@/lib/users/types";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [access, query] = await Promise.all([getCurrentAccess(), searchParams]);
  const workspaces = navigationForRoles(access.roles).flatMap((group) => group.items).filter((item) => item.href !== "/dashboard");
  return <div className="mx-auto max-w-7xl space-y-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Início</p><h1 className="text-3xl font-semibold tracking-tight">Bom trabalho.</h1><p className="mt-1 text-muted-foreground">Acesse somente os espaços relacionados às suas responsabilidades.</p></div><Badge variant={hasSupabaseEnv() ? "secondary" : "outline"}>{hasSupabaseEnv() ? "Supabase conectado" : "Modo de prévia"}</Badge></div>
    {query.status === "forbidden" && <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">Seu perfil não possui acesso a esse espaço de trabalho.</div>}
    <section aria-labelledby="workspaces-title" className="space-y-4"><div><h2 id="workspaces-title" className="text-xl font-semibold">Seus espaços de trabalho</h2><p className="text-sm text-muted-foreground">As permissões de vários papéis são combinadas automaticamente.</p></div>
      {workspaces.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{workspaces.map(({ title, description, href, icon: Icon }) => <Link key={href} href={href} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-muted/20"><CardHeader><div className="mb-2 flex items-center justify-between"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></div><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader></Card></Link>)}</div> : <Card><CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 text-center"><Layers3 className="size-8 text-muted-foreground" /><p className="font-medium">Nenhum espaço operacional atribuído</p><p className="max-w-lg text-sm text-muted-foreground">A conta está ativa, mas seus papéis não habilitam módulos de trabalho. Solicite a um administrador a revisão do acesso.</p></CardContent></Card>}
    </section>
    <Card><CardHeader><CardTitle className="text-base">Papéis ativos</CardTitle><CardDescription>{access.roles.length ? access.roles.map((role) => ROLE_LABELS[role]).join(" · ") : "Nenhum papel ativo"}</CardDescription></CardHeader></Card>
  </div>;
}
