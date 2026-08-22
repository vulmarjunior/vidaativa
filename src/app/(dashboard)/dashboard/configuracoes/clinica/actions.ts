"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  tradeName: z.string().trim().min(2).max(120), legalName: z.string().trim().min(2).max(160),
  cnpj: z.string().trim().max(20).optional(), email: z.union([z.literal(""), z.string().email()]),
  phone: z.string().trim().max(30).optional(), whatsapp: z.string().trim().max(30).optional(),
  city: z.string().trim().max(100).optional(), state: z.string().trim().length(2).optional(),
  street: z.string().trim().max(160).optional(), number: z.string().trim().max(20).optional(),
  complement: z.string().trim().max(100).optional(), district: z.string().trim().max(100).optional(),
  postalCode: z.string().trim().max(12).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/), secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function updateClinicSettings(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/dashboard/configuracoes/clinica?status=invalid");
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");
  const value = parsed.data;
  const { error } = await supabase.from("clinic_settings").update({
    trade_name: value.tradeName, legal_name: value.legalName, cnpj: value.cnpj || null,
    email: value.email || null, phone: value.phone || null, whatsapp: value.whatsapp || null,
    street: value.street || null, number: value.number || null, complement: value.complement || null,
    district: value.district || null, city: value.city || null, state: value.state?.toUpperCase() || null,
    postal_code: value.postalCode || null, primary_color: value.primaryColor, secondary_color: value.secondaryColor,
    updated_at: new Date().toISOString(), updated_by: authData.user.id,
  }).eq("singleton", true);
  if (error) redirect("/dashboard/configuracoes/clinica?status=forbidden");
  await supabase.from("audit_events").insert({ actor_id: authData.user.id, action: "clinic.settings.updated", entity_type: "clinic_settings", entity_id: "singleton" });
  revalidatePath("/", "layout");
  redirect("/dashboard/configuracoes/clinica?status=saved");
}
