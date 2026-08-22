import { CalendarCheck, ClipboardPlus, Clock3, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const metrics = [
  { label: "Atendimentos hoje", icon: CalendarCheck, detail: "Aguardando dados da agenda" }, { label: "Pacientes ativos", icon: UsersRound, detail: "Aguardando cadastro" },
  { label: "Autorizações a vencer", icon: ClipboardPlus, detail: "Aguardando convênios" }, { label: "Tempo médio de espera", icon: Clock3, detail: "Aguardando atendimentos" },
];
export default function DashboardPage() {
  const configured = hasSupabaseEnv();
  return <div className="mx-auto max-w-7xl space-y-8"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-primary">Visão geral</p><h1 className="text-3xl font-semibold tracking-tight">Bom trabalho.</h1><p className="mt-1 text-muted-foreground">Acompanhe os pontos essenciais da operação clínica.</p></div><Badge variant={configured ? "secondary" : "outline"}>{configured ? "Supabase conectado" : "Modo de prévia"}</Badge></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ label, icon: Icon, detail }) => <Card key={label}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardDescription>{label}</CardDescription><Icon className="size-4 text-primary" /></CardHeader><CardContent><p className="text-3xl font-semibold">—</p><p className="mt-2 text-xs text-muted-foreground">{detail}</p></CardContent></Card>)}</div><div className="grid gap-5 lg:grid-cols-[1.4fr_.6fr]"><Card><CardHeader><CardTitle>Agenda do dia</CardTitle><CardDescription>Os próximos atendimentos aparecerão aqui após a implantação do módulo de agenda.</CardDescription></CardHeader><CardContent><div className="grid min-h-48 place-items-center rounded-xl border border-dashed bg-muted/35 text-sm text-muted-foreground">Nenhum atendimento carregado</div></CardContent></Card><Card><CardHeader><CardTitle>Próximos passos</CardTitle><CardDescription>Fundação do sistema</CardDescription></CardHeader><CardContent className="space-y-3 text-sm"><p>1. Conectar projeto Supabase.</p><p>2. Aplicar a migration inicial.</p><p>3. Criar o primeiro administrador.</p><p>4. Completar os dados da clínica.</p></CardContent></Card></div></div>;
}
