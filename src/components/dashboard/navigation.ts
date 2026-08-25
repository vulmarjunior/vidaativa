import { Activity, CalendarDays, CircleDollarSign, ClipboardList, ClipboardPlus, Dumbbell, FileHeart, LayoutDashboard, Settings, ShieldCheck, Stethoscope, UserCog, UsersRound } from "lucide-react";
import type { AppRole } from "@/lib/users/types";

export type DashboardNavigationItem = { title: string; description: string; href: string; icon: typeof LayoutDashboard; roles: readonly AppRole[] | "all" };
export type DashboardNavigationGroup = { label: string; items: DashboardNavigationItem[] };

export const dashboardNavigationGroups: DashboardNavigationGroup[] = [
  { label: "Meu trabalho", items: [
    { title: "Início", description: "Atalhos e informações relevantes para seus papéis.", href: "/dashboard", icon: LayoutDashboard, roles: "all" },
    { title: "Agenda", description: "Agenda e jornada dos atendimentos autorizados.", href: "/dashboard/agenda", icon: CalendarDays, roles: ["reception", "doctor", "physiotherapist", "movement_professional"] },
    { title: "Pacientes", description: "Dados disponíveis conforme o contexto profissional.", href: "/dashboard/pacientes", icon: UsersRound, roles: ["reception", "doctor", "physiotherapist", "movement_professional"] },
    { title: "Medicina", description: "Consultas, prontuário médico, prescrições e documentos.", href: "/dashboard/prontuarios", icon: Stethoscope, roles: ["doctor"] },
    { title: "Fisioterapia", description: "Avaliações, planos terapêuticos e evoluções.", href: "/dashboard/fisioterapia", icon: Activity, roles: ["physiotherapist"] },
    { title: "Movimento", description: "Pilates, fortalecimento e exercícios orientados.", href: "/dashboard/movimento", icon: Dumbbell, roles: ["movement_professional"] },
  ] },
  { label: "Financeiro e convênios", items: [
    { title: "Convênios", description: "Autorizações, faturamento TISS e glosas.", href: "/dashboard/convenios", icon: ClipboardPlus, roles: ["billing", "direction"] },
    { title: "Financeiro", description: "Caixa, contas, cobranças e repasses.", href: "/dashboard/financeiro", icon: CircleDollarSign, roles: ["billing", "direction"] },
  ] },
  { label: "Gestão", items: [
    { title: "Indicadores", description: "Visão gerencial e acompanhamento da clínica.", href: "/dashboard/gestao", icon: FileHeart, roles: ["direction"] },
    { title: "Auditoria", description: "Consulta da trilha de eventos autorizada.", href: "/dashboard/auditoria", icon: ShieldCheck, roles: ["admin", "direction"] },
  ] },
  { label: "Administração do sistema", items: [
    { title: "Cadastros", description: "Profissionais, serviços, salas e recursos.", href: "/dashboard/cadastros", icon: ClipboardList, roles: ["admin"] },
    { title: "Usuários", description: "Contas, vínculos e papéis de acesso.", href: "/dashboard/configuracoes/usuarios", icon: UserCog, roles: ["admin"] },
    { title: "Configurações", description: "Identidade e parâmetros institucionais.", href: "/dashboard/configuracoes/clinica", icon: Settings, roles: ["admin"] },
  ] },
];

export const dashboardNavigation = dashboardNavigationGroups.flatMap((group) => group.items);
export function canAccessNavigationItem(item: DashboardNavigationItem, roles: readonly AppRole[]) { return item.roles === "all" || item.roles.some((role) => roles.includes(role)); }
export function navigationForRoles(roles: readonly AppRole[]) { return dashboardNavigationGroups.map((group) => ({ ...group, items: group.items.filter((item) => canAccessNavigationItem(item, roles)) })).filter((group) => group.items.length > 0); }
