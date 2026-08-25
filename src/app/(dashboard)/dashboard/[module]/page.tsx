import { notFound, redirect } from "next/navigation";
import { canAccessNavigationItem, dashboardNavigation } from "@/components/dashboard/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentAccess } from "@/lib/auth/access";

export default async function ModulePlaceholder({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params; const item = dashboardNavigation.find((entry) => entry.href === `/dashboard/${module}`);
  if (!item || module === "configuracoes") notFound();
  const access = await getCurrentAccess();
  if (!canAccessNavigationItem(item, access.roles)) redirect("/dashboard?status=forbidden");
  return <div className="mx-auto max-w-5xl"><p className="text-sm font-medium text-primary">Espaço de trabalho</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{item.title}</h1><p className="mt-2 text-muted-foreground">{item.description}</p><Card className="mt-6"><CardHeader><CardTitle>Estrutura preparada</CardTitle><CardDescription>Este módulo será implementado na etapa correspondente do roadmap.</CardDescription></CardHeader><CardContent><div className="grid min-h-56 place-items-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">Nenhum dado cadastrado</div></CardContent></Card></div>;
}
