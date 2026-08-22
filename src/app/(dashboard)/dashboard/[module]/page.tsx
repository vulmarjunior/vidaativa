import { notFound } from "next/navigation";
import { dashboardNavigation } from "@/components/dashboard/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ModulePlaceholder({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params; const item = dashboardNavigation.find((entry) => entry.href === `/dashboard/${module}`);
  if (!item || module === "configuracoes") notFound();
  return <div className="mx-auto max-w-5xl"><p className="text-sm font-medium text-primary">Módulo do PRD</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{item.title}</h1><Card className="mt-6"><CardHeader><CardTitle>Estrutura preparada</CardTitle><CardDescription>Este módulo será implementado na etapa correspondente do roadmap.</CardDescription></CardHeader><CardContent><div className="grid min-h-56 place-items-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">Nenhum dado cadastrado</div></CardContent></Card></div>;
}
