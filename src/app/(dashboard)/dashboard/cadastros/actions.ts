"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const uuid = z.string().uuid();
const text = z.string().trim().min(2).max(160);

async function requireAdmin() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) redirect("/login");
  const [{ data: profile }, { data: adminRole }] = await Promise.all([
    supabase.from("profiles").select("active").eq("user_id", authData.user.id).single<{ active: boolean }>(),
    supabase.from("profile_roles").select("role").eq("user_id", authData.user.id).eq("role", "admin").eq("active", true).maybeSingle(),
  ]);
  if (!profile?.active || !adminRole) redirect("/dashboard/cadastros?status=forbidden");
  return { supabase, userId: authData.user.id };
}

function finish(status: "saved" | "invalid" | "error", path = "/dashboard/cadastros"): never {
  revalidatePath(path);
  redirect(`${path}?status=${status}`);
}

export async function createProfessional(formData: FormData) {
  const parsed = z.object({ fullName: text, displayName: z.string().trim().max(120).optional(), email: z.union([z.literal(""), z.string().email()]), phone: z.string().trim().max(30).optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid");
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("professionals").insert({ full_name: parsed.data.fullName, display_name: parsed.data.displayName || null, email: parsed.data.email || null, phone: parsed.data.phone || null, created_by: userId, updated_by: userId });
  finish(error ? "error" : "saved");
}

export async function createCategory(formData: FormData) {
  const parsed = z.object({ name: text, description: z.string().trim().max(500).optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("service_categories").insert({ name: parsed.data.name, description: parsed.data.description || null });
  finish(error ? "error" : "saved");
}

export async function createService(formData: FormData) {
  const parsed = z.object({ name: text, categoryId: uuid, duration: z.coerce.number().int().min(5).max(1440), capacity: z.coerce.number().int().min(1).max(1000) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid");
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("services").insert({ name: parsed.data.name, category_id: parsed.data.categoryId, default_duration_minutes: parsed.data.duration, default_capacity: parsed.data.capacity, created_by: userId, updated_by: userId });
  finish(error ? "error" : "saved");
}

async function createAsset(kind: "rooms" | "resources", formData: FormData) {
  const parsed = z.object({ name: text, amount: z.coerce.number().int().min(1).max(1000), exclusive: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid");
  const { supabase } = await requireAdmin();
  const common = { name: parsed.data.name, exclusive_use: parsed.data.exclusive === "on" };
  const result = kind === "rooms"
    ? await supabase.from("rooms").insert({ ...common, capacity: parsed.data.amount })
    : await supabase.from("resources").insert({ ...common, quantity: parsed.data.amount });
  const { error } = result;
  finish(error ? "error" : "saved");
}

export async function createRoom(formData: FormData) { return createAsset("rooms", formData); }
export async function createResource(formData: FormData) { return createAsset("resources", formData); }

async function createNamedReference(table: "professions" | "specialties" | "activity_categories", formData: FormData) {
  const parsed = z.object({ name: text }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid", "/dashboard/cadastros/estruturas");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from(table).insert({ name: parsed.data.name });
  finish(error ? "error" : "saved", "/dashboard/cadastros/estruturas");
}

export async function createProfession(formData: FormData) { return createNamedReference("professions", formData); }
export async function createSpecialty(formData: FormData) { return createNamedReference("specialties", formData); }
export async function createActivityCategory(formData: FormData) { return createNamedReference("activity_categories", formData); }

export async function createCouncil(formData: FormData) {
  const parsed = z.object({ name: text, acronym: z.string().trim().min(2).max(20) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid", "/dashboard/cadastros/estruturas");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("professional_councils").insert({ name: parsed.data.name, acronym: parsed.data.acronym.toUpperCase() });
  finish(error ? "error" : "saved", "/dashboard/cadastros/estruturas");
}

export async function createQualification(formData: FormData) {
  const parsed = z.object({ name: text, issuer: z.string().trim().max(160).optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid", "/dashboard/cadastros/estruturas");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("qualifications").insert({ name: parsed.data.name, issuer: parsed.data.issuer || null });
  finish(error ? "error" : "saved", "/dashboard/cadastros/estruturas");
}

export async function createActivity(formData: FormData) {
  const parsed = z.object({ name: text, categoryId: uuid, description: z.string().trim().max(500).optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid", "/dashboard/cadastros/estruturas");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("activities").insert({ name: parsed.data.name, category_id: parsed.data.categoryId, description: parsed.data.description || null });
  finish(error ? "error" : "saved", "/dashboard/cadastros/estruturas");
}

const toggleTables = ["professionals", "service_categories", "services", "rooms", "resources", "professions", "professional_councils", "specialties", "qualifications", "activity_categories", "activities"] as const;
export async function toggleCatalogItem(formData: FormData) {
  const parsed = z.object({ table: z.enum(toggleTables), id: uuid, active: z.enum(["true", "false"]), returnTo: z.enum(["/dashboard/cadastros", "/dashboard/cadastros/estruturas"]).optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) finish("invalid");
  const { supabase, userId } = await requireAdmin();
  if (parsed.data.table === "specialties") {
    const { data: specialty } = await supabase.from("specialties").select("official").eq("id", parsed.data.id).single<{ official: boolean }>();
    if (specialty?.official) finish("invalid", parsed.data.returnTo ?? "/dashboard/cadastros");
  }
  const update = parsed.data.table === "professionals" || parsed.data.table === "services"
    ? { active: parsed.data.active !== "true", updated_by: userId }
    : { active: parsed.data.active !== "true" };
  const { error } = await supabase.from(parsed.data.table).update(update).eq("id", parsed.data.id);
  finish(error ? "error" : "saved", parsed.data.returnTo ?? "/dashboard/cadastros");
}

const associationSchema = z.object({ serviceId: uuid, targetId: uuid, enabled: z.enum(["true", "false"]) });
const associationTables = {
  capability: { table: "service_capabilities", column: "capability_id" },
  delivery: { table: "service_delivery_modes", column: "delivery_mode_id" },
  billing: { table: "service_billing_modes", column: "billing_mode_id" },
  room: { table: "service_rooms", column: "room_id" },
  resource: { table: "service_resources", column: "resource_id" },
  professional: { table: "service_professionals", column: "professional_id" },
} as const;

export async function toggleServiceAssociation(kind: keyof typeof associationTables, formData: FormData) {
  const parsed = associationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/dashboard/cadastros?status=invalid");
  const { supabase } = await requireAdmin();
  const config = associationTables[kind];
  const values = { service_id: parsed.data.serviceId, [config.column]: parsed.data.targetId, active: parsed.data.enabled !== "true" };
  const { error } = await supabase.from(config.table).upsert(values, { onConflict: `service_id,${config.column}` });
  revalidatePath(`/dashboard/cadastros/servicos/${parsed.data.serviceId}`);
  redirect(`/dashboard/cadastros/servicos/${parsed.data.serviceId}?status=${error ? "error" : "saved"}`);
}

export async function addServicePrice(formData: FormData) {
  const parsed = z.object({ serviceId: uuid, billingModeId: z.union([z.literal(""), uuid]), amount: z.coerce.number().min(0).max(9999999999), validFrom: z.iso.date() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/dashboard/cadastros?status=invalid");
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("service_prices").insert({ service_id: parsed.data.serviceId, billing_mode_id: parsed.data.billingModeId || null, amount: parsed.data.amount, valid_from: parsed.data.validFrom, created_by: userId });
  revalidatePath(`/dashboard/cadastros/servicos/${parsed.data.serviceId}`);
  redirect(`/dashboard/cadastros/servicos/${parsed.data.serviceId}?status=${error ? "error" : "saved"}`);
}

function professionalPath(professionalId: string, status: "saved" | "invalid" | "error"): never {
  revalidatePath(`/dashboard/cadastros/profissionais/${professionalId}`);
  redirect(`/dashboard/cadastros/profissionais/${professionalId}?status=${status}`);
}

export async function updateProfessional(professionalId: string, formData: FormData) {
  const parsedId = uuid.safeParse(professionalId);
  const parsed = z.object({ fullName: text, displayName: z.string().trim().max(120).optional(), email: z.union([z.literal(""), z.string().email()]), phone: z.string().trim().max(30).optional() }).safeParse(Object.fromEntries(formData));
  if (!parsedId.success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase, userId } = await requireAdmin();
  const { error } = await supabase.from("professionals").update({ full_name: parsed.data.fullName, display_name: parsed.data.displayName || null, email: parsed.data.email || null, phone: parsed.data.phone || null, updated_by: userId }).eq("id", professionalId);
  professionalPath(professionalId, error ? "error" : "saved");
}

export async function addProfessionalRegistration(professionalId: string, formData: FormData) {
  const parsedId = uuid.safeParse(professionalId);
  const parsed = z.object({ professionId: uuid, councilId: z.union([z.literal(""), uuid]), stateCode: z.string().trim().max(2), registrationNumber: z.string().trim().max(40), primary: z.string().optional() }).superRefine((value, context) => {
    const councilFields = [value.councilId, value.stateCode, value.registrationNumber];
    const filled = councilFields.filter(Boolean).length;
    if (filled !== 0 && filled !== 3) context.addIssue({ code: "custom", message: "Conselho, UF e número devem ser informados juntos." });
  }).safeParse(Object.fromEntries(formData));
  if (!parsedId.success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("professional_registrations").insert({ professional_id: professionalId, profession_id: parsed.data.professionId, council_id: parsed.data.councilId || null, state_code: parsed.data.stateCode.toUpperCase() || null, registration_number: parsed.data.registrationNumber || null, primary_registration: parsed.data.primary === "on" });
  professionalPath(professionalId, error ? "error" : "saved");
}

export async function toggleProfessionalSpecialty(professionalId: string, formData: FormData) {
  const parsed = z.object({ specialtyId: uuid, enabled: z.enum(["true", "false"]) }).safeParse(Object.fromEntries(formData));
  if (!uuid.safeParse(professionalId).success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase } = await requireAdmin();
  const enabling = parsed.data.enabled !== "true";
  const { data: specialty } = await supabase.from("specialties").select("profession_id").eq("id", parsed.data.specialtyId).single<{ profession_id: string | null }>();
  if (!specialty?.profession_id) professionalPath(professionalId, "invalid");
  const { data: professionRegistration } = await supabase.from("professional_registrations").select("id").eq("professional_id", professionalId).eq("profession_id", specialty.profession_id).eq("active", true).limit(1).maybeSingle();
  if (!professionRegistration) professionalPath(professionalId, "invalid");
  if (enabling) {
    const { data: prerequisites } = await supabase.from("specialty_prerequisites").select("prerequisite_specialty_id").eq("specialty_id", parsed.data.specialtyId);
    const requiredIds = (prerequisites ?? []).map((item) => item.prerequisite_specialty_id);
    if (requiredIds.length > 0) {
      const { data: selected } = await supabase.from("professional_specialties").select("specialty_id").eq("professional_id", professionalId).eq("active", true).in("specialty_id", requiredIds);
      if ((selected ?? []).length !== requiredIds.length) professionalPath(professionalId, "invalid");
    }
  } else {
    const { data: dependents } = await supabase.from("specialty_prerequisites").select("specialty_id").eq("prerequisite_specialty_id", parsed.data.specialtyId);
    const dependentIds = (dependents ?? []).map((item) => item.specialty_id);
    if (dependentIds.length > 0) {
      const { data: selectedDependent } = await supabase.from("professional_specialties").select("specialty_id").eq("professional_id", professionalId).eq("active", true).in("specialty_id", dependentIds).limit(1);
      if ((selectedDependent ?? []).length > 0) professionalPath(professionalId, "invalid");
    }
  }
  const { error } = await supabase.from("professional_specialties").upsert({ professional_id: professionalId, specialty_id: parsed.data.specialtyId, active: parsed.data.enabled !== "true" }, { onConflict: "professional_id,specialty_id" });
  professionalPath(professionalId, error ? "error" : "saved");
}

export async function addSpecialtyRegistration(professionalId: string, formData: FormData) {
  const parsed = z.object({
    specialtyId: uuid,
    councilId: uuid,
    stateCode: z.string().trim().length(2),
    rqeNumber: z.string().trim().min(1).max(40),
    validFrom: z.string().trim(),
    validUntil: z.string().trim(),
  }).safeParse(Object.fromEntries(formData));
  if (!uuid.safeParse(professionalId).success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase } = await requireAdmin();
  const { data: baseRegistration } = await supabase.from("professional_registrations").select("id").eq("professional_id", professionalId).eq("council_id", parsed.data.councilId).eq("state_code", parsed.data.stateCode.toUpperCase()).eq("active", true).limit(1).maybeSingle();
  if (!baseRegistration) professionalPath(professionalId, "invalid");
  const { error } = await supabase.from("specialty_registrations").insert({
    professional_id: professionalId,
    specialty_id: parsed.data.specialtyId,
    council_id: parsed.data.councilId,
    state_code: parsed.data.stateCode.toUpperCase(),
    rqe_number: parsed.data.rqeNumber,
    valid_from: parsed.data.validFrom || null,
    valid_until: parsed.data.validUntil || null,
    verification_status: "pending",
  });
  professionalPath(professionalId, error ? "error" : "saved");
}

export async function reviewSpecialtyRegistration(
  professionalId: string,
  decision: "verified" | "rejected" | "inconclusive",
  formData: FormData,
) {
  const parsed = z.object({
    id: uuid,
    sourceUrl: z.union([z.literal(""), z.string().url().startsWith("https://")]),
  }).superRefine((value, context) => {
    if (decision === "verified" && !value.sourceUrl) {
      context.addIssue({ code: "custom", message: "A fonte oficial é obrigatória para confirmar o RQE." });
    }
  }).safeParse(Object.fromEntries(formData));
  if (!uuid.safeParse(professionalId).success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase, userId } = await requireAdmin();
  const verified = decision === "verified";
  const { error } = await supabase.from("specialty_registrations").update({
    verification_status: decision,
    verification_source_url: parsed.data.sourceUrl || null,
    verified_at: verified ? new Date().toISOString() : null,
    verified_by: verified ? userId : null,
  }).eq("id", parsed.data.id).eq("professional_id", professionalId);
  professionalPath(professionalId, error ? "error" : "saved");
}

export async function addProfessionalQualification(professionalId: string, formData: FormData) {
  const parsed = z.object({ qualificationId: uuid, certificateNumber: z.string().trim().max(80).optional(), issuedOn: z.string().trim(), expiresOn: z.string().trim() }).safeParse(Object.fromEntries(formData));
  if (!uuid.safeParse(professionalId).success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase } = await requireAdmin();
  const { data: existing } = await supabase.from("professional_qualifications").select("id").eq("professional_id", professionalId).eq("qualification_id", parsed.data.qualificationId).eq("active", true).maybeSingle();
  if (existing) professionalPath(professionalId, "error");
  const { error } = await supabase.from("professional_qualifications").insert({ professional_id: professionalId, qualification_id: parsed.data.qualificationId, certificate_number: parsed.data.certificateNumber || null, issued_on: parsed.data.issuedOn || null, expires_on: parsed.data.expiresOn || null });
  professionalPath(professionalId, error ? "error" : "saved");
}

export async function toggleProfessionalService(professionalId: string, formData: FormData) {
  const parsed = z.object({ serviceId: uuid, enabled: z.enum(["true", "false"]), durationOverride: z.union([z.literal(""), z.coerce.number().int().min(5).max(1440)]) }).safeParse(Object.fromEntries(formData));
  if (!uuid.safeParse(professionalId).success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("service_professionals").upsert({ professional_id: professionalId, service_id: parsed.data.serviceId, duration_override_minutes: parsed.data.durationOverride || null, active: parsed.data.enabled !== "true" }, { onConflict: "service_id,professional_id" });
  professionalPath(professionalId, error ? "error" : "saved");
}

export async function toggleProfessionalRecord(kind: "registration" | "qualification", professionalId: string, formData: FormData) {
  const parsed = z.object({ id: uuid, active: z.enum(["true", "false"]) }).safeParse(Object.fromEntries(formData));
  if (!uuid.safeParse(professionalId).success || !parsed.success) professionalPath(professionalId, "invalid");
  const { supabase } = await requireAdmin();
  const table = kind === "registration" ? "professional_registrations" : "professional_qualifications";
  const { error } = await supabase.from(table).update({ active: parsed.data.active !== "true" }).eq("id", parsed.data.id).eq("professional_id", professionalId);
  professionalPath(professionalId, error ? "error" : "saved");
}
