"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClinicBrand } from "@/components/brand/clinic-brand";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { dashboardNavigation } from "./navigation";
import type { ClinicSettings } from "@/lib/clinic/types";

export function AppSidebar({ clinic }: { clinic: ClinicSettings }) {
  const pathname = usePathname();
  return <Sidebar variant="inset"><SidebarHeader className="p-4"><ClinicBrand clinic={clinic} /></SidebarHeader><SidebarContent><SidebarGroup><SidebarGroupLabel>Gestão da clínica</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{dashboardNavigation.map((item) => <SidebarMenuItem key={item.href}><SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}><Link href={item.href}><item.icon /><span>{item.title}</span></Link></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent><SidebarFooter className="p-4 text-xs text-muted-foreground">Ambiente interno • single-tenant</SidebarFooter></Sidebar>;
}
