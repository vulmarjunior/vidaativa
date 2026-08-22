import { ClinicMark } from "./clinic-mark";
import type { ClinicSettings } from "@/lib/clinic/types";

export function ClinicBrand({ compact = false, clinic }: { compact?: boolean; clinic?: Pick<ClinicSettings, "tradeName"> }) {
  return <div className="flex items-center gap-3"><ClinicMark />{!compact && <div className="leading-tight"><p className="font-semibold tracking-tight">{clinic?.tradeName ?? "Clínica Vida Ativa"}</p><p className="text-xs text-muted-foreground">Cuidado em movimento</p></div>}</div>;
}
