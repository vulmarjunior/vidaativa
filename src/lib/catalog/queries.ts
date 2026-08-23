import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CatalogItem = { id: string; name: string; active: boolean };
export type SpecialtyCatalogItem = CatalogItem & { profession_id: string | null; official_code: string | null; classification: "specialty" | "area_of_practice"; official: boolean; professions: { name: string } | null; specialty_catalog_releases: { version_label: string; source_url: string; regulatory_authorities: { acronym: string } | null } | null };
export type ProfessionalItem = CatalogItem & { display_name: string | null; email: string | null; phone: string | null };
export type ServiceItem = CatalogItem & {
  category_id: string;
  default_duration_minutes: number;
  default_capacity: number;
  service_categories: { name: string } | null;
};

export type CatalogData = {
  role: string | null;
  professionals: ProfessionalItem[];
  categories: CatalogItem[];
  services: ServiceItem[];
  rooms: (CatalogItem & { capacity: number; exclusive_use: boolean })[];
  resources: (CatalogItem & { quantity: number; exclusive_use: boolean })[];
  error: string | null;
};

export type StructuralCatalogData = {
  role: string | null;
  professions: CatalogItem[];
  councils: (CatalogItem & { acronym: string })[];
  specialties: SpecialtyCatalogItem[];
  qualifications: (CatalogItem & { issuer: string | null })[];
  activityCategories: CatalogItem[];
  activities: (CatalogItem & { category_id: string; activity_categories: { name: string } | null })[];
  error: string | null;
};

export type ServiceConfiguration = {
  role: string | null;
  service: (ServiceItem & { description: string | null; default_interval_minutes: number }) | null;
  capabilities: CatalogItem[];
  selectedCapabilityIds: string[];
  deliveryModes: CatalogItem[];
  selectedDeliveryModeIds: string[];
  billingModes: CatalogItem[];
  selectedBillingModeIds: string[];
  rooms: (CatalogItem & { capacity: number })[];
  selectedRoomIds: string[];
  resources: (CatalogItem & { quantity: number })[];
  selectedResourceIds: string[];
  prices: { id: string; amount: number; valid_from: string; valid_until: string | null; billing_modes: { name: string } | null }[];
  professionals: ProfessionalItem[];
  selectedProfessionalIds: string[];
  error: string | null;
};

export type ProfessionalConfiguration = {
  role: string | null;
  professional: ProfessionalItem | null;
  professions: CatalogItem[];
  councils: (CatalogItem & { acronym: string })[];
  states: { code: string; name: string }[];
  registrations: { id: string; profession_id: string; registration_number: string | null; state_code: string | null; active: boolean; primary_registration: boolean; professions: { name: string } | null; professional_councils: { acronym: string } | null }[];
  specialties: SpecialtyCatalogItem[];
  selectedSpecialtyIds: string[];
  specialtyPrerequisites: { specialty_id: string; prerequisite_specialty_id: string }[];
  specialtyRegistrations: { id: string; specialty_id: string; council_id: string; state_code: string; rqe_number: string; valid_from: string | null; valid_until: string | null; verification_status: "pending" | "verified" | "rejected" | "inconclusive"; verification_source_url: string | null; active: boolean; specialties: { name: string } | null; professional_councils: { acronym: string } | null }[];
  qualifications: (CatalogItem & { issuer: string | null })[];
  assignedQualifications: { id: string; qualification_id: string; certificate_number: string | null; expires_on: string | null; qualifications: { name: string } | null }[];
  services: ServiceItem[];
  assignedServices: { id: string; service_id: string; duration_override_minutes: number | null; active: boolean }[];
  error: string | null;
};

const emptyData: CatalogData = {
  role: null, professionals: [], categories: [], services: [], rooms: [], resources: [], error: null,
};

export async function getCatalogData(): Promise<CatalogData> {
  if (!hasSupabaseEnv()) return { ...emptyData, error: "Supabase não configurado." };
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { ...emptyData, error: "Sessão não autenticada." };

  const [profile, professionals, categories, services, rooms, resources] = await Promise.all([
    supabase.from("profiles").select("role").eq("user_id", authData.user.id).single<{ role: string }>(),
    supabase.from("professionals").select("id,full_name,display_name,email,phone,active").order("full_name"),
    supabase.from("service_categories").select("id,name,active").order("sort_order").order("name"),
    supabase.from("services").select("id,name,active,category_id,default_duration_minutes,default_capacity,service_categories(name)").order("name"),
    supabase.from("rooms").select("id,name,active,capacity,exclusive_use").order("name"),
    supabase.from("resources").select("id,name,active,quantity,exclusive_use").order("name"),
  ]);
  const firstError = [profile.error, professionals.error, categories.error, services.error, rooms.error, resources.error].find(Boolean);
  return {
    role: profile.data?.role ?? null,
    professionals: (professionals.data ?? []).map((item) => ({ ...item, name: item.full_name })) as ProfessionalItem[],
    categories: (categories.data ?? []) as CatalogItem[],
    services: (services.data ?? []) as unknown as ServiceItem[],
    rooms: (rooms.data ?? []) as CatalogData["rooms"],
    resources: (resources.data ?? []) as CatalogData["resources"],
    error: firstError ? "Os cadastros ainda não estão disponíveis. Verifique a migration e as permissões." : null,
  };
}

async function getAuthenticatedCatalogClient() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", authData.user.id).single<{ role: string }>();
  return { supabase, role: profile?.role ?? null };
}

export async function getStructuralCatalogData(): Promise<StructuralCatalogData> {
  const context = await getAuthenticatedCatalogClient();
  const empty: StructuralCatalogData = { role: null, professions: [], councils: [], specialties: [], qualifications: [], activityCategories: [], activities: [], error: null };
  if (!context) return { ...empty, error: "Sessão não autenticada." };
  const { supabase, role } = context;
  const [professions, councils, specialties, specialtyReleases, regulatoryAuthorities, qualifications, activityCategories, activities] = await Promise.all([
    supabase.from("professions").select("id,name,active").order("name"),
    supabase.from("professional_councils").select("id,name,acronym,active").order("acronym"),
    supabase.from("specialties").select("id,name,active,profession_id,catalog_release_id,official_code,classification,official").order("name"),
    supabase.from("specialty_catalog_releases").select("id,version_label,source_url,regulatory_authority_id"),
    supabase.from("regulatory_authorities").select("id,acronym"),
    supabase.from("qualifications").select("id,name,issuer,active").order("name"),
    supabase.from("activity_categories").select("id,name,active").order("sort_order").order("name"),
    supabase.from("activities").select("id,name,active,category_id,activity_categories(name)").order("name"),
  ]);
  const firstError = [professions.error, councils.error, specialties.error, specialtyReleases.error, regulatoryAuthorities.error, qualifications.error, activityCategories.error, activities.error].find(Boolean);
  const professionMap = new Map((professions.data ?? []).map((item) => [item.id, { name: item.name }]));
  const authorityMap = new Map((regulatoryAuthorities.data ?? []).map((item) => [item.id, { acronym: item.acronym }]));
  const releaseMap = new Map((specialtyReleases.data ?? []).map((item) => [item.id, { version_label: item.version_label, source_url: item.source_url, regulatory_authorities: authorityMap.get(item.regulatory_authority_id) ?? null }]));
  return {
    role,
    professions: (professions.data ?? []) as CatalogItem[],
    councils: (councils.data ?? []) as StructuralCatalogData["councils"],
    specialties: (specialties.data ?? []).map((item) => ({ ...item, professions: item.profession_id ? professionMap.get(item.profession_id) ?? null : null, specialty_catalog_releases: item.catalog_release_id ? releaseMap.get(item.catalog_release_id) ?? null : null })) as SpecialtyCatalogItem[],
    qualifications: (qualifications.data ?? []) as StructuralCatalogData["qualifications"],
    activityCategories: (activityCategories.data ?? []) as CatalogItem[],
    activities: (activities.data ?? []) as unknown as StructuralCatalogData["activities"],
    error: firstError ? "Não foi possível carregar os cadastros estruturais." : null,
  };
}

export async function getServiceConfiguration(serviceId: string): Promise<ServiceConfiguration> {
  const context = await getAuthenticatedCatalogClient();
  const empty: ServiceConfiguration = { role: null, service: null, capabilities: [], selectedCapabilityIds: [], deliveryModes: [], selectedDeliveryModeIds: [], billingModes: [], selectedBillingModeIds: [], rooms: [], selectedRoomIds: [], resources: [], selectedResourceIds: [], prices: [], professionals: [], selectedProfessionalIds: [], error: null };
  if (!context) return { ...empty, error: "Sessão não autenticada." };
  const { supabase, role } = context;
  const [service, capabilities, selectedCapabilities, deliveryModes, selectedDeliveryModes, billingModes, selectedBillingModes, rooms, selectedRooms, resources, selectedResources, prices, professionals, selectedProfessionals] = await Promise.all([
    supabase.from("services").select("id,name,active,category_id,description,default_duration_minutes,default_interval_minutes,default_capacity,service_categories(name)").eq("id", serviceId).single(),
    supabase.from("capabilities").select("id,name,active").eq("active", true).order("name"),
    supabase.from("service_capabilities").select("capability_id").eq("service_id", serviceId).eq("active", true),
    supabase.from("delivery_modes").select("id,name,active").eq("active", true).order("name"),
    supabase.from("service_delivery_modes").select("delivery_mode_id").eq("service_id", serviceId).eq("active", true),
    supabase.from("billing_modes").select("id,name,active").eq("active", true).order("name"),
    supabase.from("service_billing_modes").select("billing_mode_id").eq("service_id", serviceId).eq("active", true),
    supabase.from("rooms").select("id,name,active,capacity").eq("active", true).order("name"),
    supabase.from("service_rooms").select("room_id").eq("service_id", serviceId).eq("active", true),
    supabase.from("resources").select("id,name,active,quantity").eq("active", true).order("name"),
    supabase.from("service_resources").select("resource_id").eq("service_id", serviceId).eq("active", true),
    supabase.from("service_prices").select("id,amount,valid_from,valid_until,billing_modes(name)").eq("service_id", serviceId).order("valid_from", { ascending: false }),
    supabase.from("professionals").select("id,full_name,display_name,email,phone,active").eq("active", true).order("full_name"),
    supabase.from("service_professionals").select("professional_id").eq("service_id", serviceId).eq("active", true),
  ]);
  const errors = [service.error, capabilities.error, selectedCapabilities.error, deliveryModes.error, selectedDeliveryModes.error, billingModes.error, selectedBillingModes.error, rooms.error, selectedRooms.error, resources.error, selectedResources.error, prices.error, professionals.error, selectedProfessionals.error];
  return {
    role,
    service: service.data as unknown as ServiceConfiguration["service"],
    capabilities: (capabilities.data ?? []) as CatalogItem[], selectedCapabilityIds: (selectedCapabilities.data ?? []).map((item) => item.capability_id),
    deliveryModes: (deliveryModes.data ?? []) as CatalogItem[], selectedDeliveryModeIds: (selectedDeliveryModes.data ?? []).map((item) => item.delivery_mode_id),
    billingModes: (billingModes.data ?? []) as CatalogItem[], selectedBillingModeIds: (selectedBillingModes.data ?? []).map((item) => item.billing_mode_id),
    rooms: (rooms.data ?? []) as ServiceConfiguration["rooms"], selectedRoomIds: (selectedRooms.data ?? []).map((item) => item.room_id),
    resources: (resources.data ?? []) as ServiceConfiguration["resources"], selectedResourceIds: (selectedResources.data ?? []).map((item) => item.resource_id),
    prices: (prices.data ?? []) as unknown as ServiceConfiguration["prices"],
    professionals: (professionals.data ?? []).map((item) => ({ ...item, name: item.full_name })) as ProfessionalItem[], selectedProfessionalIds: (selectedProfessionals.data ?? []).map((item) => item.professional_id),
    error: errors.find(Boolean) ? "Não foi possível carregar toda a configuração do serviço." : null,
  };
}

export async function getProfessionalConfiguration(professionalId: string): Promise<ProfessionalConfiguration> {
  const context = await getAuthenticatedCatalogClient();
  const empty: ProfessionalConfiguration = { role: null, professional: null, professions: [], councils: [], states: [], registrations: [], specialties: [], selectedSpecialtyIds: [], specialtyPrerequisites: [], specialtyRegistrations: [], qualifications: [], assignedQualifications: [], services: [], assignedServices: [], error: null };
  if (!context) return { ...empty, error: "Sessão não autenticada." };
  const { supabase, role } = context;
  const [professional, professions, councils, states, registrations, specialties, specialtyReleases, regulatoryAuthorities, selectedSpecialties, specialtyPrerequisites, specialtyRegistrations, qualifications, assignedQualifications, services, assignedServices] = await Promise.all([
    supabase.from("professionals").select("id,full_name,display_name,email,phone,active").eq("id", professionalId).single(),
    supabase.from("professions").select("id,name,active").eq("active", true).order("name"),
    supabase.from("professional_councils").select("id,name,acronym,active").eq("active", true).order("acronym"),
    supabase.from("states").select("code,name").eq("active", true).order("name"),
    supabase.from("professional_registrations").select("id,profession_id,registration_number,state_code,active,primary_registration,professions(name),professional_councils(acronym)").eq("professional_id", professionalId).order("primary_registration", { ascending: false }),
    supabase.from("specialties").select("id,name,active,profession_id,catalog_release_id,official_code,classification,official").eq("active", true).order("classification").order("name"),
    supabase.from("specialty_catalog_releases").select("id,version_label,source_url,regulatory_authority_id"),
    supabase.from("regulatory_authorities").select("id,acronym"),
    supabase.from("professional_specialties").select("specialty_id").eq("professional_id", professionalId).eq("active", true),
    supabase.from("specialty_prerequisites").select("specialty_id,prerequisite_specialty_id"),
    supabase.from("specialty_registrations").select("id,specialty_id,council_id,state_code,rqe_number,valid_from,valid_until,verification_status,verification_source_url,active,specialties(name),professional_councils(acronym)").eq("professional_id", professionalId).order("created_at", { ascending: false }),
    supabase.from("qualifications").select("id,name,issuer,active").eq("active", true).order("name"),
    supabase.from("professional_qualifications").select("id,qualification_id,certificate_number,expires_on,qualifications(name)").eq("professional_id", professionalId).eq("active", true),
    supabase.from("services").select("id,name,active,category_id,default_duration_minutes,default_capacity,service_categories(name)").eq("active", true).order("name"),
    supabase.from("service_professionals").select("id,service_id,duration_override_minutes,active").eq("professional_id", professionalId).eq("active", true),
  ]);
  const errors = [professional.error, professions.error, councils.error, states.error, registrations.error, specialties.error, specialtyReleases.error, regulatoryAuthorities.error, selectedSpecialties.error, specialtyPrerequisites.error, specialtyRegistrations.error, qualifications.error, assignedQualifications.error, services.error, assignedServices.error];
  const professionalProfessionMap = new Map((professions.data ?? []).map((item) => [item.id, { name: item.name }]));
  const professionalAuthorityMap = new Map((regulatoryAuthorities.data ?? []).map((item) => [item.id, { acronym: item.acronym }]));
  const professionalReleaseMap = new Map((specialtyReleases.data ?? []).map((item) => [item.id, { version_label: item.version_label, source_url: item.source_url, regulatory_authorities: professionalAuthorityMap.get(item.regulatory_authority_id) ?? null }]));
  return {
    role,
    professional: professional.data ? ({ ...professional.data, name: professional.data.full_name } as ProfessionalItem) : null,
    professions: (professions.data ?? []) as CatalogItem[],
    councils: (councils.data ?? []) as ProfessionalConfiguration["councils"],
    states: (states.data ?? []) as ProfessionalConfiguration["states"],
    registrations: (registrations.data ?? []) as unknown as ProfessionalConfiguration["registrations"],
    specialties: (specialties.data ?? []).map((item) => ({ ...item, professions: item.profession_id ? professionalProfessionMap.get(item.profession_id) ?? null : null, specialty_catalog_releases: item.catalog_release_id ? professionalReleaseMap.get(item.catalog_release_id) ?? null : null })) as ProfessionalConfiguration["specialties"],
    selectedSpecialtyIds: (selectedSpecialties.data ?? []).map((item) => item.specialty_id),
    specialtyPrerequisites: (specialtyPrerequisites.data ?? []) as ProfessionalConfiguration["specialtyPrerequisites"],
    specialtyRegistrations: (specialtyRegistrations.data ?? []) as unknown as ProfessionalConfiguration["specialtyRegistrations"],
    qualifications: (qualifications.data ?? []) as ProfessionalConfiguration["qualifications"],
    assignedQualifications: (assignedQualifications.data ?? []) as unknown as ProfessionalConfiguration["assignedQualifications"],
    services: (services.data ?? []) as unknown as ServiceItem[],
    assignedServices: (assignedServices.data ?? []) as ProfessionalConfiguration["assignedServices"],
    error: errors.find(Boolean) ? "Não foi possível carregar toda a ficha profissional." : null,
  };
}
