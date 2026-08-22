import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getClinicSettings } from "@/lib/clinic/queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const clinic = await getClinicSettings();
  return <SidebarProvider><AppSidebar clinic={clinic} /><SidebarInset><DashboardHeader /><main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main></SidebarInset></SidebarProvider>;
}
