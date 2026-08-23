-- TASK-002: versioned official specialty catalogs and professional RQE records.
-- Existing specialties remain valid as legacy/local records until explicitly classified.

create table public.regulatory_authorities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym text not null,
  official_website_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regulatory_authorities_name_not_blank check (btrim(name) <> ''),
  constraint regulatory_authorities_acronym_not_blank check (btrim(acronym) <> ''),
  constraint regulatory_authorities_website_format check (
    official_website_url is null or official_website_url ~* '^https://'
  )
);
create unique index regulatory_authorities_acronym_unique_idx
  on public.regulatory_authorities (upper(acronym));

create table public.specialty_catalog_releases (
  id uuid primary key default gen_random_uuid(),
  regulatory_authority_id uuid not null references public.regulatory_authorities(id) on delete restrict,
  profession_id uuid not null references public.professions(id) on delete restrict,
  title text not null,
  version_label text not null,
  source_url text not null,
  published_on date,
  effective_from date,
  effective_until date,
  imported_at timestamptz not null default now(),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint specialty_catalog_releases_title_not_blank check (btrim(title) <> ''),
  constraint specialty_catalog_releases_version_not_blank check (btrim(version_label) <> ''),
  constraint specialty_catalog_releases_source_format check (source_url ~* '^https://'),
  constraint specialty_catalog_releases_validity check (
    effective_until is null or effective_from is null or effective_until >= effective_from
  ),
  unique (regulatory_authority_id, profession_id, version_label),
  unique (id, profession_id)
);
create index specialty_catalog_releases_authority_id_idx
  on public.specialty_catalog_releases (regulatory_authority_id);
create index specialty_catalog_releases_profession_id_idx
  on public.specialty_catalog_releases (profession_id);
create unique index specialty_catalog_releases_active_unique_idx
  on public.specialty_catalog_releases (regulatory_authority_id, profession_id)
  where active;

alter table public.specialties
  add column profession_id uuid references public.professions(id) on delete restrict,
  add column catalog_release_id uuid references public.specialty_catalog_releases(id) on delete restrict,
  add column official_code text,
  add column classification text not null default 'specialty',
  add column official boolean not null default false,
  add column effective_from date,
  add column effective_until date,
  add constraint specialties_classification_check
    check (classification in ('specialty', 'area_of_practice')),
  add constraint specialties_official_source_check
    check (not official or (profession_id is not null and catalog_release_id is not null)),
  add constraint specialties_release_profession_fkey
    foreign key (catalog_release_id, profession_id)
    references public.specialty_catalog_releases(id, profession_id) on delete restrict,
  add constraint specialties_validity_check
    check (effective_until is null or effective_from is null or effective_until >= effective_from);

drop index public.specialties_name_unique_idx;
create unique index specialties_legacy_name_unique_idx
  on public.specialties (lower(name))
  where profession_id is null;
create unique index specialties_profession_name_unique_idx
  on public.specialties (profession_id, lower(name))
  where profession_id is not null;
create unique index specialties_release_code_unique_idx
  on public.specialties (catalog_release_id, upper(official_code))
  where catalog_release_id is not null and official_code is not null;
create index specialties_profession_classification_idx
  on public.specialties (profession_id, classification, active)
  where profession_id is not null;
create index specialties_catalog_release_id_idx
  on public.specialties (catalog_release_id)
  where catalog_release_id is not null;

create table public.specialty_prerequisites (
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  prerequisite_specialty_id uuid not null references public.specialties(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (specialty_id, prerequisite_specialty_id),
  constraint specialty_prerequisites_not_self check (specialty_id <> prerequisite_specialty_id)
);
create index specialty_prerequisites_prerequisite_id_idx
  on public.specialty_prerequisites (prerequisite_specialty_id);

create table public.specialty_registrations (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null,
  specialty_id uuid not null,
  council_id uuid not null references public.professional_councils(id) on delete restrict,
  state_code char(2) not null references public.states(code) on delete restrict,
  rqe_number text not null,
  valid_from date,
  valid_until date,
  verification_status text not null default 'pending',
  verified_at timestamptz,
  verified_by uuid references auth.users(id) on delete restrict,
  verification_source_url text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint specialty_registrations_professional_specialty_fkey
    foreign key (professional_id, specialty_id)
    references public.professional_specialties(professional_id, specialty_id) on delete restrict,
  constraint specialty_registrations_rqe_not_blank check (btrim(rqe_number) <> ''),
  constraint specialty_registrations_validity check (
    valid_until is null or valid_from is null or valid_until >= valid_from
  ),
  constraint specialty_registrations_verification_status_check
    check (verification_status in ('pending', 'verified', 'rejected', 'inconclusive')),
  constraint specialty_registrations_verification_data_check check (
    (verification_status = 'verified' and verified_at is not null and verified_by is not null)
    or (verification_status <> 'verified')
  ),
  constraint specialty_registrations_source_format check (
    verification_source_url is null or verification_source_url ~* '^https://'
  )
);
create index specialty_registrations_professional_id_idx
  on public.specialty_registrations (professional_id);
create index specialty_registrations_specialty_id_idx
  on public.specialty_registrations (specialty_id);
create index specialty_registrations_council_id_idx
  on public.specialty_registrations (council_id);
create index specialty_registrations_verified_by_idx
  on public.specialty_registrations (verified_by)
  where verified_by is not null;
create unique index specialty_registrations_active_rqe_unique_idx
  on public.specialty_registrations (
    professional_id,
    specialty_id,
    council_id,
    state_code,
    upper(rqe_number)
  ) where active;

insert into public.regulatory_authorities (name, acronym, official_website_url)
values
  ('Conselho Federal de Medicina', 'CFM', 'https://portal.cfm.org.br/'),
  ('Conselho Federal de Fisioterapia e Terapia Ocupacional', 'COFFITO', 'https://www.coffito.gov.br/');

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'regulatory_authorities', 'specialty_catalog_releases', 'specialty_registrations'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on public.%I for each row execute function private.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end $$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'regulatory_authorities', 'specialty_catalog_releases', 'specialty_prerequisites',
    'specialty_registrations'
  ] loop
    execute format(
      'create trigger %I_audit after insert or update on public.%I for each row execute function private.audit_structural_change()',
      table_name,
      table_name
    );
  end loop;
end $$;

create trigger specialties_regulatory_audit
  after update of profession_id, catalog_release_id, official_code, classification,
    official, effective_from, effective_until
  on public.specialties
  for each row execute function private.audit_structural_change();

alter table public.regulatory_authorities enable row level security;
alter table public.specialty_catalog_releases enable row level security;
alter table public.specialty_prerequisites enable row level security;
alter table public.specialty_registrations enable row level security;

grant select on public.regulatory_authorities, public.specialty_catalog_releases,
  public.specialty_prerequisites, public.specialty_registrations
to authenticated;

grant insert, update on public.regulatory_authorities, public.specialty_catalog_releases,
  public.specialty_prerequisites, public.specialty_registrations
to authenticated;

create policy regulatory_authorities_authenticated_read
  on public.regulatory_authorities for select to authenticated
  using ((select private.current_user_role()) is not null);
create policy specialty_catalog_releases_authenticated_read
  on public.specialty_catalog_releases for select to authenticated
  using ((select private.current_user_role()) is not null);
create policy specialty_prerequisites_authenticated_read
  on public.specialty_prerequisites for select to authenticated
  using ((select private.current_user_role()) is not null);
create policy specialty_registrations_authenticated_read
  on public.specialty_registrations for select to authenticated
  using ((select private.current_user_role()) is not null);

create policy regulatory_authorities_admin_insert
  on public.regulatory_authorities for insert to authenticated
  with check ((select private.current_user_role()) = 'admin');
create policy regulatory_authorities_admin_update
  on public.regulatory_authorities for update to authenticated
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');
create policy specialty_catalog_releases_admin_insert
  on public.specialty_catalog_releases for insert to authenticated
  with check ((select private.current_user_role()) = 'admin');
create policy specialty_catalog_releases_admin_update
  on public.specialty_catalog_releases for update to authenticated
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');
create policy specialty_prerequisites_admin_insert
  on public.specialty_prerequisites for insert to authenticated
  with check ((select private.current_user_role()) = 'admin');
create policy specialty_prerequisites_admin_update
  on public.specialty_prerequisites for update to authenticated
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');
create policy specialty_registrations_admin_insert
  on public.specialty_registrations for insert to authenticated
  with check ((select private.current_user_role()) = 'admin');
create policy specialty_registrations_admin_update
  on public.specialty_registrations for update to authenticated
  using ((select private.current_user_role()) = 'admin')
  with check ((select private.current_user_role()) = 'admin');
