-- TASK-002: structural catalog for professionals, services, activities and resources.
-- Clinical care plans and session execution are intentionally reserved for a future migration.

create table public.states (
  code char(2) primary key,
  name text not null unique,
  active boolean not null default true,
  constraint states_code_format check (code = upper(code) and code ~ '^[A-Z]{2}$'),
  constraint states_name_not_blank check (btrim(name) <> '')
);

create table public.professions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professions_name_not_blank check (btrim(name) <> '')
);
create unique index professions_name_unique_idx on public.professions (lower(name));

create table public.professional_councils (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_councils_name_not_blank check (btrim(name) <> ''),
  constraint professional_councils_acronym_not_blank check (btrim(acronym) <> '')
);
create unique index professional_councils_acronym_unique_idx on public.professional_councils (upper(acronym));

create table public.professionals (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  display_name text,
  email text,
  phone text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete restrict,
  constraint professionals_full_name_not_blank check (btrim(full_name) <> ''),
  constraint professionals_email_format check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);
create index professionals_active_name_idx on public.professionals (active, full_name);
create index professionals_created_by_idx on public.professionals (created_by) where created_by is not null;
create index professionals_updated_by_idx on public.professionals (updated_by) where updated_by is not null;

alter table public.profiles
  add constraint profiles_professional_id_fkey
  foreign key (professional_id) references public.professionals(id) on delete restrict;
create unique index profiles_professional_id_unique_idx on public.profiles (professional_id) where professional_id is not null;

create table public.professional_registrations (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete restrict,
  profession_id uuid not null references public.professions(id) on delete restrict,
  council_id uuid references public.professional_councils(id) on delete restrict,
  state_code char(2) references public.states(code) on delete restrict,
  registration_number text,
  primary_registration boolean not null default false,
  valid_from date,
  valid_until date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_registrations_council_complete check (
    (council_id is null and state_code is null and registration_number is null)
    or (council_id is not null and state_code is not null and btrim(registration_number) <> '')
  ),
  constraint professional_registrations_validity check (valid_until is null or valid_from is null or valid_until >= valid_from)
);
create index professional_registrations_professional_id_idx on public.professional_registrations (professional_id);
create index professional_registrations_profession_id_idx on public.professional_registrations (profession_id);
create index professional_registrations_council_id_idx on public.professional_registrations (council_id) where council_id is not null;
create index professional_registrations_state_code_idx on public.professional_registrations (state_code) where state_code is not null;
create unique index professional_registrations_number_unique_idx
  on public.professional_registrations (council_id, state_code, upper(registration_number))
  where council_id is not null and registration_number is not null;
create unique index professional_registrations_primary_unique_idx
  on public.professional_registrations (professional_id) where primary_registration and active;

create table public.specialties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint specialties_name_not_blank check (btrim(name) <> '')
);
create unique index specialties_name_unique_idx on public.specialties (lower(name));

create table public.professional_specialties (
  professional_id uuid not null references public.professionals(id) on delete restrict,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  primary_specialty boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (professional_id, specialty_id)
);
create index professional_specialties_specialty_id_idx on public.professional_specialties (specialty_id);
create unique index professional_specialties_primary_unique_idx
  on public.professional_specialties (professional_id) where primary_specialty and active;

create table public.qualifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint qualifications_name_not_blank check (btrim(name) <> '')
);
create unique index qualifications_name_issuer_unique_idx on public.qualifications (lower(name), lower(coalesce(issuer, '')));

create table public.professional_qualifications (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals(id) on delete restrict,
  qualification_id uuid not null references public.qualifications(id) on delete restrict,
  certificate_number text,
  issued_on date,
  expires_on date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint professional_qualifications_validity check (expires_on is null or issued_on is null or expires_on >= issued_on),
  unique (professional_id, qualification_id, certificate_number)
);
create index professional_qualifications_professional_id_idx on public.professional_qualifications (professional_id);
create index professional_qualifications_qualification_id_idx on public.professional_qualifications (qualification_id);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color_token text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_categories_name_not_blank check (btrim(name) <> ''),
  constraint service_categories_sort_order_nonnegative check (sort_order >= 0)
);
create unique index service_categories_name_unique_idx on public.service_categories (lower(name));
create index service_categories_active_sort_idx on public.service_categories (active, sort_order, name);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete restrict,
  name text not null,
  description text,
  default_duration_minutes integer not null,
  default_interval_minutes integer not null default 0,
  default_capacity integer not null default 1,
  requires_prior_assessment boolean not null default false,
  separately_billable boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete restrict,
  updated_by uuid references auth.users(id) on delete restrict,
  constraint services_name_not_blank check (btrim(name) <> ''),
  constraint services_duration_positive check (default_duration_minutes between 5 and 1440),
  constraint services_interval_nonnegative check (default_interval_minutes between 0 and 1440),
  constraint services_capacity_positive check (default_capacity between 1 and 1000)
);
create unique index services_category_name_unique_idx on public.services (category_id, lower(name));
create index services_category_id_idx on public.services (category_id);
create index services_active_name_idx on public.services (active, name);
create index services_created_by_idx on public.services (created_by) where created_by is not null;
create index services_updated_by_idx on public.services (updated_by) where updated_by is not null;

create table public.capabilities (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint capabilities_code_format check (code ~ '^[a-z][a-z0-9_]*$'),
  constraint capabilities_name_not_blank check (btrim(name) <> '')
);
create unique index capabilities_code_unique_idx on public.capabilities (code);
create unique index capabilities_name_unique_idx on public.capabilities (lower(name));

create table public.service_capabilities (
  service_id uuid not null references public.services(id) on delete restrict,
  capability_id uuid not null references public.capabilities(id) on delete restrict,
  required boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (service_id, capability_id)
);
create index service_capabilities_capability_id_idx on public.service_capabilities (capability_id);

create table public.delivery_modes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  active boolean not null default true,
  constraint delivery_modes_code_format check (code ~ '^[a-z][a-z0-9_]*$'),
  constraint delivery_modes_name_not_blank check (btrim(name) <> '')
);
create unique index delivery_modes_code_unique_idx on public.delivery_modes (code);
create unique index delivery_modes_name_unique_idx on public.delivery_modes (lower(name));

create table public.service_delivery_modes (
  service_id uuid not null references public.services(id) on delete restrict,
  delivery_mode_id uuid not null references public.delivery_modes(id) on delete restrict,
  capacity_override integer,
  active boolean not null default true,
  primary key (service_id, delivery_mode_id),
  constraint service_delivery_modes_capacity_positive check (capacity_override is null or capacity_override between 1 and 1000)
);
create index service_delivery_modes_mode_id_idx on public.service_delivery_modes (delivery_mode_id);

create table public.service_professionals (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete restrict,
  professional_id uuid not null references public.professionals(id) on delete restrict,
  duration_override_minutes integer,
  interval_override_minutes integer,
  capacity_override integer,
  valid_from date,
  valid_until date,
  authorization_notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_professionals_duration_positive check (duration_override_minutes is null or duration_override_minutes between 5 and 1440),
  constraint service_professionals_interval_nonnegative check (interval_override_minutes is null or interval_override_minutes between 0 and 1440),
  constraint service_professionals_capacity_positive check (capacity_override is null or capacity_override between 1 and 1000),
  constraint service_professionals_validity check (valid_until is null or valid_from is null or valid_until >= valid_from),
  unique (service_id, professional_id)
);
create index service_professionals_service_id_idx on public.service_professionals (service_id);
create index service_professionals_professional_id_idx on public.service_professionals (professional_id);

create table public.billing_modes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  active boolean not null default true,
  constraint billing_modes_code_format check (code ~ '^[a-z][a-z0-9_]*$'),
  constraint billing_modes_name_not_blank check (btrim(name) <> '')
);
create unique index billing_modes_code_unique_idx on public.billing_modes (code);
create unique index billing_modes_name_unique_idx on public.billing_modes (lower(name));

create table public.service_billing_modes (
  service_id uuid not null references public.services(id) on delete restrict,
  billing_mode_id uuid not null references public.billing_modes(id) on delete restrict,
  active boolean not null default true,
  primary key (service_id, billing_mode_id)
);
create index service_billing_modes_mode_id_idx on public.service_billing_modes (billing_mode_id);

create table public.service_prices (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete restrict,
  billing_mode_id uuid references public.billing_modes(id) on delete restrict,
  amount numeric(12,2) not null,
  valid_from date not null,
  valid_until date,
  notes text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete restrict,
  constraint service_prices_amount_nonnegative check (amount >= 0),
  constraint service_prices_validity check (valid_until is null or valid_until >= valid_from)
);
create index service_prices_service_id_idx on public.service_prices (service_id, valid_from desc);
create index service_prices_billing_mode_id_idx on public.service_prices (billing_mode_id) where billing_mode_id is not null;
create index service_prices_created_by_idx on public.service_prices (created_by) where created_by is not null;
create unique index service_prices_start_unique_idx
  on public.service_prices (service_id, coalesce(billing_mode_id, '00000000-0000-0000-0000-000000000000'::uuid), valid_from);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  capacity integer not null default 1,
  exclusive_use boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rooms_name_not_blank check (btrim(name) <> ''),
  constraint rooms_capacity_positive check (capacity between 1 and 1000)
);
create unique index rooms_name_unique_idx on public.rooms (lower(name));

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  inventory_code text,
  quantity integer not null default 1,
  exclusive_use boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resources_name_not_blank check (btrim(name) <> ''),
  constraint resources_quantity_positive check (quantity >= 1)
);
create unique index resources_inventory_code_unique_idx on public.resources (upper(inventory_code)) where inventory_code is not null;
create unique index resources_name_unique_idx on public.resources (lower(name));

create table public.service_rooms (
  service_id uuid not null references public.services(id) on delete restrict,
  room_id uuid not null references public.rooms(id) on delete restrict,
  required boolean not null default false,
  active boolean not null default true,
  primary key (service_id, room_id)
);
create index service_rooms_room_id_idx on public.service_rooms (room_id);

create table public.service_resources (
  service_id uuid not null references public.services(id) on delete restrict,
  resource_id uuid not null references public.resources(id) on delete restrict,
  quantity_required integer not null default 1,
  required boolean not null default true,
  active boolean not null default true,
  primary key (service_id, resource_id),
  constraint service_resources_quantity_positive check (quantity_required >= 1)
);
create index service_resources_resource_id_idx on public.service_resources (resource_id);

create table public.activity_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activity_categories_name_not_blank check (btrim(name) <> ''),
  constraint activity_categories_sort_order_nonnegative check (sort_order >= 0)
);
create unique index activity_categories_name_unique_idx on public.activity_categories (lower(name));

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.activity_categories(id) on delete restrict,
  name text not null,
  description text,
  instructions text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_name_not_blank check (btrim(name) <> '')
);
create unique index activities_category_name_unique_idx on public.activities (category_id, lower(name));
create index activities_category_id_idx on public.activities (category_id);
create index activities_active_name_idx on public.activities (active, name);

create table public.parameter_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  data_type text not null,
  unit text,
  minimum_value numeric,
  maximum_value numeric,
  allowed_values jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parameter_definitions_code_format check (code ~ '^[a-z][a-z0-9_]*$'),
  constraint parameter_definitions_name_not_blank check (btrim(name) <> ''),
  constraint parameter_definitions_data_type check (data_type in ('integer', 'decimal', 'text', 'duration', 'distance', 'choice', 'boolean')),
  constraint parameter_definitions_range check (maximum_value is null or minimum_value is null or maximum_value >= minimum_value),
  constraint parameter_definitions_choices check (
    (data_type = 'choice' and jsonb_typeof(allowed_values) = 'array' and jsonb_array_length(allowed_values) > 0)
    or (data_type <> 'choice' and allowed_values is null)
  )
);
create unique index parameter_definitions_code_unique_idx on public.parameter_definitions (code);

create table public.activity_parameters (
  activity_id uuid not null references public.activities(id) on delete restrict,
  parameter_definition_id uuid not null references public.parameter_definitions(id) on delete restrict,
  required boolean not null default false,
  sort_order integer not null default 0,
  active boolean not null default true,
  primary key (activity_id, parameter_definition_id),
  constraint activity_parameters_sort_order_nonnegative check (sort_order >= 0)
);
create index activity_parameters_definition_id_idx on public.activity_parameters (parameter_definition_id);

create table public.activity_resources (
  activity_id uuid not null references public.activities(id) on delete restrict,
  resource_id uuid not null references public.resources(id) on delete restrict,
  quantity_required integer not null default 1,
  required boolean not null default false,
  active boolean not null default true,
  primary key (activity_id, resource_id),
  constraint activity_resources_quantity_positive check (quantity_required >= 1)
);
create index activity_resources_resource_id_idx on public.activity_resources (resource_id);

create table public.form_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint form_templates_name_not_blank check (btrim(name) <> '')
);
create unique index form_templates_name_unique_idx on public.form_templates (lower(name));

create table public.form_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.form_templates(id) on delete restrict,
  version_number integer not null,
  schema_definition jsonb not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete restrict,
  constraint form_template_versions_number_positive check (version_number >= 1),
  constraint form_template_versions_schema_object check (jsonb_typeof(schema_definition) = 'object'),
  constraint form_template_versions_status check (status in ('draft', 'published', 'retired')),
  unique (template_id, version_number)
);
create index form_template_versions_template_id_idx on public.form_template_versions (template_id);
create index form_template_versions_created_by_idx on public.form_template_versions (created_by) where created_by is not null;

create table public.service_forms (
  service_id uuid not null references public.services(id) on delete restrict,
  form_template_id uuid not null references public.form_templates(id) on delete restrict,
  required boolean not null default false,
  completion_moment text not null,
  active boolean not null default true,
  primary key (service_id, form_template_id, completion_moment),
  constraint service_forms_moment check (completion_moment in ('booking', 'before_service', 'during_service', 'after_service'))
);
create index service_forms_template_id_idx on public.service_forms (form_template_id);

create table public.term_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint term_templates_name_not_blank check (btrim(name) <> '')
);
create unique index term_templates_name_unique_idx on public.term_templates (lower(name));

create table public.term_template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.term_templates(id) on delete restrict,
  version_number integer not null,
  content text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete restrict,
  constraint term_template_versions_number_positive check (version_number >= 1),
  constraint term_template_versions_content_not_blank check (btrim(content) <> ''),
  constraint term_template_versions_status check (status in ('draft', 'published', 'retired')),
  unique (template_id, version_number)
);
create index term_template_versions_template_id_idx on public.term_template_versions (template_id);
create index term_template_versions_created_by_idx on public.term_template_versions (created_by) where created_by is not null;

create table public.service_terms (
  service_id uuid not null references public.services(id) on delete restrict,
  term_template_id uuid not null references public.term_templates(id) on delete restrict,
  required boolean not null default true,
  acceptance_moment text not null,
  active boolean not null default true,
  primary key (service_id, term_template_id, acceptance_moment),
  constraint service_terms_moment check (acceptance_moment in ('booking', 'before_service', 'during_service'))
);
create index service_terms_template_id_idx on public.service_terms (term_template_id);

insert into public.states (code, name) values
  ('AC', 'Acre'), ('AL', 'Alagoas'), ('AP', 'Amapá'), ('AM', 'Amazonas'), ('BA', 'Bahia'),
  ('CE', 'Ceará'), ('DF', 'Distrito Federal'), ('ES', 'Espírito Santo'), ('GO', 'Goiás'),
  ('MA', 'Maranhão'), ('MT', 'Mato Grosso'), ('MS', 'Mato Grosso do Sul'), ('MG', 'Minas Gerais'),
  ('PA', 'Pará'), ('PB', 'Paraíba'), ('PR', 'Paraná'), ('PE', 'Pernambuco'), ('PI', 'Piauí'),
  ('RJ', 'Rio de Janeiro'), ('RN', 'Rio Grande do Norte'), ('RS', 'Rio Grande do Sul'),
  ('RO', 'Rondônia'), ('RR', 'Roraima'), ('SC', 'Santa Catarina'), ('SP', 'São Paulo'),
  ('SE', 'Sergipe'), ('TO', 'Tocantins');

insert into public.delivery_modes (code, name) values ('individual', 'Individual'), ('group', 'Coletivo');
insert into public.billing_modes (code, name) values
  ('private', 'Particular'), ('insurance', 'Convênio'), ('package', 'Pacote'),
  ('subscription', 'Mensalidade'), ('not_separately_billable', 'Não faturável isoladamente');
insert into public.capabilities (code, name, description) values
  ('assessment', 'Avaliação', 'Permite avaliação assistencial.'),
  ('care_plan', 'Plano assistencial', 'Permite plano terapêutico ou programa individual.'),
  ('evolution', 'Evolução', 'Permite registro de evolução.'),
  ('training_plan', 'Ficha de treino', 'Permite ficha individual de exercícios.'),
  ('session_record', 'Registro de sessão', 'Permite registrar a execução de uma sessão.'),
  ('reassessment', 'Reavaliação', 'Permite reavaliação assistencial.');
insert into public.parameter_definitions (code, name, data_type, unit, minimum_value) values
  ('sets', 'Séries', 'integer', null, 0), ('repetitions', 'Repetições', 'integer', null, 0),
  ('load', 'Carga', 'decimal', 'kg', 0), ('duration', 'Duração', 'duration', 'min', 0),
  ('distance', 'Distância', 'distance', 'm', 0), ('speed', 'Velocidade', 'decimal', 'km/h', 0),
  ('interval', 'Intervalo', 'duration', 's', 0), ('frequency', 'Frequência', 'text', null, null),
  ('amplitude', 'Amplitude', 'decimal', 'graus', null), ('side', 'Lado', 'text', null, null),
  ('region', 'Região', 'text', null, null), ('orientation', 'Orientação', 'text', null, null),
  ('progression_criterion', 'Critério de progressão', 'text', null, null),
  ('intensity', 'Intensidade', 'text', null, null);

create or replace function private.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

create or replace function private.audit_structural_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  changed_id text;
begin
  if (select auth.uid()) is null then
    return new;
  end if;
  changed_id := coalesce(to_jsonb(new)->>'id', to_jsonb(new)->>'service_id');
  insert into public.audit_events (actor_id, action, entity_type, entity_id, metadata)
  values ((select auth.uid()), lower(tg_op), tg_table_name, changed_id, jsonb_build_object('source', 'database_trigger'));
  return new;
end;
$$;
revoke all on function private.audit_structural_change() from public, anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'professions', 'professional_councils', 'professionals', 'professional_registrations',
    'specialties', 'qualifications', 'service_categories', 'services', 'capabilities',
    'service_professionals', 'rooms', 'resources', 'activity_categories',
    'activities', 'parameter_definitions', 'form_templates', 'term_templates'
  ] loop
    execute format('create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name, table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'professionals', 'professional_registrations', 'professional_specialties', 'professional_qualifications',
    'service_categories', 'services', 'service_capabilities', 'service_delivery_modes',
    'service_professionals', 'service_billing_modes', 'service_prices', 'rooms', 'resources',
    'service_rooms', 'service_resources', 'activity_categories', 'activities', 'activity_parameters',
    'activity_resources', 'service_forms', 'service_terms'
  ] loop
    execute format('create trigger %I_audit after insert or update on public.%I for each row execute function private.audit_structural_change()', table_name, table_name);
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'states', 'professions', 'professional_councils', 'professionals', 'professional_registrations',
    'specialties', 'professional_specialties', 'qualifications', 'professional_qualifications',
    'service_categories', 'services', 'capabilities', 'service_capabilities', 'delivery_modes',
    'service_delivery_modes', 'service_professionals', 'billing_modes', 'service_billing_modes',
    'service_prices', 'rooms', 'resources', 'service_rooms', 'service_resources',
    'activity_categories', 'activities', 'parameter_definitions', 'activity_parameters',
    'activity_resources', 'form_templates', 'form_template_versions', 'service_forms',
    'term_templates', 'term_template_versions', 'service_terms'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end $$;

grant select on public.states, public.professions, public.professional_councils, public.professionals,
  public.professional_registrations, public.specialties, public.professional_specialties,
  public.qualifications, public.professional_qualifications, public.service_categories, public.services,
  public.capabilities, public.service_capabilities, public.delivery_modes, public.service_delivery_modes,
  public.service_professionals, public.billing_modes, public.service_billing_modes, public.rooms,
  public.resources, public.service_rooms, public.service_resources, public.activity_categories,
  public.activities, public.parameter_definitions, public.activity_parameters, public.activity_resources,
  public.form_templates, public.service_forms, public.term_templates, public.service_terms
to authenticated;

grant select on public.service_prices to authenticated;
grant select on public.form_template_versions, public.term_template_versions to authenticated;

grant insert, update on public.professions, public.professional_councils, public.professionals,
  public.professional_registrations, public.specialties, public.professional_specialties,
  public.qualifications, public.professional_qualifications, public.service_categories, public.services,
  public.capabilities, public.service_capabilities, public.delivery_modes, public.service_delivery_modes,
  public.service_professionals, public.billing_modes, public.service_billing_modes,
  public.rooms, public.resources, public.service_rooms, public.service_resources, public.activity_categories,
  public.activities, public.parameter_definitions, public.activity_parameters, public.activity_resources,
  public.form_templates, public.form_template_versions, public.service_forms, public.term_templates,
  public.term_template_versions, public.service_terms
to authenticated;

grant insert on public.service_prices to authenticated;
grant update (valid_until, notes) on public.service_prices to authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'states', 'professions', 'professional_councils', 'professionals', 'professional_registrations',
    'specialties', 'professional_specialties', 'qualifications', 'professional_qualifications',
    'service_categories', 'services', 'capabilities', 'service_capabilities', 'delivery_modes',
    'service_delivery_modes', 'service_professionals', 'billing_modes', 'service_billing_modes',
    'rooms', 'resources', 'service_rooms', 'service_resources', 'activity_categories', 'activities',
    'parameter_definitions', 'activity_parameters', 'activity_resources', 'form_templates', 'service_forms',
    'term_templates', 'service_terms'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.current_user_role()) is not null)',
      table_name || '_authenticated_read', table_name
    );
  end loop;
end $$;

create policy service_prices_authorized_read on public.service_prices for select to authenticated
  using ((select private.current_user_role()) in ('admin', 'direction', 'reception', 'billing'));
create policy form_template_versions_authorized_read on public.form_template_versions for select to authenticated
  using ((select private.current_user_role()) in ('admin', 'direction', 'doctor', 'physiotherapist', 'movement_professional'));
create policy term_template_versions_authorized_read on public.term_template_versions for select to authenticated
  using ((select private.current_user_role()) in ('admin', 'direction', 'doctor', 'physiotherapist', 'movement_professional'));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'professions', 'professional_councils', 'professionals', 'professional_registrations',
    'specialties', 'professional_specialties', 'qualifications', 'professional_qualifications',
    'service_categories', 'services', 'capabilities', 'service_capabilities', 'delivery_modes',
    'service_delivery_modes', 'service_professionals', 'billing_modes', 'service_billing_modes',
    'rooms', 'resources', 'service_rooms', 'service_resources', 'activity_categories',
    'activities', 'parameter_definitions', 'activity_parameters', 'activity_resources', 'form_templates',
    'form_template_versions', 'service_forms', 'term_templates', 'term_template_versions', 'service_terms'
  ] loop
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.current_user_role()) = ''admin'')',
      table_name || '_admin_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.current_user_role()) = ''admin'') with check ((select private.current_user_role()) = ''admin'')',
      table_name || '_admin_update', table_name
    );
  end loop;
end $$;

create policy service_prices_admin_insert on public.service_prices for insert to authenticated
  with check ((select private.current_user_role()) = 'admin');
create policy service_prices_admin_update on public.service_prices for update to authenticated
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');
