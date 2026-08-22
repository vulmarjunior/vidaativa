import { defaultClinicSettings } from "./defaults";
import type { ClinicSettings } from "./types";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type ClinicRow = {
  legal_name: string; trade_name: string; cnpj: string | null; logo_url: string | null;
  email: string | null; phone: string | null; whatsapp: string | null; street: string | null;
  number: string | null; complement: string | null; district: string | null; city: string | null;
  state: string | null; postal_code: string | null; primary_color: string; secondary_color: string;
};

export async function getClinicSettings(): Promise<ClinicSettings> {
  if (!hasSupabaseEnv()) return defaultClinicSettings;
  const supabase = await createClient();
  const { data, error } = await supabase.from("clinic_settings").select("*").eq("singleton", true).single<ClinicRow>();
  if (error || !data) return defaultClinicSettings;
  return { legalName: data.legal_name, tradeName: data.trade_name, cnpj: data.cnpj, logoUrl: data.logo_url,
    email: data.email, phone: data.phone, whatsapp: data.whatsapp, street: data.street, number: data.number,
    complement: data.complement, district: data.district, city: data.city, state: data.state,
    postalCode: data.postal_code, primaryColor: data.primary_color, secondaryColor: data.secondary_color };
}
