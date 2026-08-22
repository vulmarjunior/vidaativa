import { Activity, Cross } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClinicMark({ className }: { className?: string }) {
  return <span className={cn("relative grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm", className)} aria-hidden="true">
    <Cross className="size-5" strokeWidth={2.4} />
    <Activity className="absolute -right-1 -bottom-1 size-4 rounded-full bg-secondary p-0.5 text-secondary-foreground ring-2 ring-background" />
  </span>;
}
