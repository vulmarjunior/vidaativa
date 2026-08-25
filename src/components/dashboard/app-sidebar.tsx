"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClinicBrand } from "@/components/brand/clinic-brand";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { navigationForRoles } from "./navigation";
import type { ClinicSettings } from "@/lib/clinic/types";
import type { AppRole } from "@/lib/users/types";

export function AppSidebar({ clinic, roles }: { clinic: ClinicSettings; roles: AppRole[] }) {
  const pathname = usePathname();
  const groups = navigationForRoles(roles);
  return <Sidebar variant="inset"><SidebarHeader className="p-4"><ClinicBrand clinic={clinic} /></SidebarHeader><SidebarContent>{groups.map((group) => <SidebarGroup key={group.label}><SidebarGroupLabel>{group.label}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{group.items.map((item) => <SidebarMenuItem key={item.href}><SidebarMenuButton asChild isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))} tooltip={item.title}><Link href={item.href}><item.icon /><span>{item.title}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>)}</SidebarContent><SidebarFooter className="p-4 text-xs text-muted-foreground">Ambiente interno • acessos por perfil</SidebarFooter></Sidebar>;
}
