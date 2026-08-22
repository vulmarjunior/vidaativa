import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return <header className="flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur md:px-6"><div className="flex items-center gap-3"><SidebarTrigger><Menu /></SidebarTrigger><div><p className="text-sm font-medium">Gestão Clínica</p><p className="text-xs text-muted-foreground">Operação integrada</p></div></div><div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Notificações"><Bell className="size-4" /></Button><Avatar className="size-9"><AvatarFallback className="bg-primary text-xs text-primary-foreground">VA</AvatarFallback></Avatar></div></header>;
}
