import { CalendarDays, CircleDollarSign, ClipboardPlus, FileHeart, LayoutDashboard, Settings, ShieldCheck, UsersRound } from "lucide-react";
export const dashboardNavigation = [
  { title: "Visão geral", href: "/dashboard", icon: LayoutDashboard }, { title: "Agenda", href: "/dashboard/agenda", icon: CalendarDays },
  { title: "Pacientes", href: "/dashboard/pacientes", icon: UsersRound }, { title: "Prontuários", href: "/dashboard/prontuarios", icon: FileHeart },
  { title: "Convênios", href: "/dashboard/convenios", icon: ClipboardPlus }, { title: "Financeiro", href: "/dashboard/financeiro", icon: CircleDollarSign },
  { title: "Auditoria", href: "/dashboard/auditoria", icon: ShieldCheck }, { title: "Configurações", href: "/dashboard/configuracoes/clinica", icon: Settings },
];
