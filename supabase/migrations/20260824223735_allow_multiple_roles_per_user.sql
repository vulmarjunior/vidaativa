create table public.profile_roles (
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  role public.app_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete restrict,
  primary key (user_id, role)
);

comment on table public.profile_roles is
  'Papéis acumuláveis por conta. Registros são inativados, nunca excluídos pela aplicação.';
comment on column public.profiles.role is
  'Legado temporário para compatibilidade de implantação. Não usar para autorização; consultar profile_roles.';

insert into public.profile_roles (user_id, role)
select user_id, role
from public.profiles;

create index profile_roles_active_role_user_idx
  on public.profile_roles (role, user_id)
  where active = true;

alter table public.profile_roles enable row level security;
revoke all on table public.profile_roles from anon, authenticated;
grant select, insert, update on table public.profile_roles to authenticated;

create or replace function private.current_user_has_active_profile()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = (select auth.uid())
      and active = true
  )
$$;

create or replace function private.current_user_has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.profile_roles pr on pr.user_id = p.user_id
    where p.user_id = (select auth.uid())
      and p.active = true
      and pr.active = true
      and pr.role = required_role
  )
$$;

create or replace function private.current_user_has_any_role(required_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join public.profile_roles pr on pr.user_id = p.user_id
    where p.user_id = (select auth.uid())
      and p.active = true
      and pr.active = true
      and pr.role = any(required_roles)
  )
$$;

revoke all on function private.current_user_has_active_profile() from public, anon, authenticated;
revoke all on function private.current_user_has_role(public.app_role) from public, anon, authenticated;
revoke all on function private.current_user_has_any_role(public.app_role[]) from public, anon, authenticated;
grant execute on function private.current_user_has_active_profile() to authenticated;
grant execute on function private.current_user_has_role(public.app_role) to authenticated;
grant execute on function private.current_user_has_any_role(public.app_role[]) to authenticated;

drop policy "management updates clinic settings" on public.clinic_settings;
create policy "management updates clinic settings" on public.clinic_settings for update to authenticated
  using ((select private.current_user_has_any_role(array['admin', 'direction']::public.app_role[])))
  with check ((select private.current_user_has_any_role(array['admin', 'direction']::public.app_role[])));

drop policy "users read own profile or management reads all" on public.profiles;
create policy "users read own profile or management reads all" on public.profiles for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.current_user_has_any_role(array['admin', 'direction']::public.app_role[]))
  );

drop policy "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles for update to authenticated
  using ((select private.current_user_has_role('admin')))
  with check ((select private.current_user_has_role('admin')));

drop policy "management reads audit events" on public.audit_events;
create policy "management reads audit events" on public.audit_events for select to authenticated
  using ((select private.current_user_has_any_role(array['admin', 'direction']::public.app_role[])));

create policy profile_roles_own_or_management_read on public.profile_roles for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.current_user_has_any_role(array['admin', 'direction']::public.app_role[]))
  );
create policy profile_roles_admin_insert on public.profile_roles for insert to authenticated
  with check ((select private.current_user_has_role('admin')));
create policy profile_roles_admin_update on public.profile_roles for update to authenticated
  using ((select private.current_user_has_role('admin')))
  with check ((select private.current_user_has_role('admin')));

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
    execute format('drop policy %I on public.%I', table_name || '_authenticated_read', table_name);
    execute format(
      'create policy %I on public.%I for select to authenticated using ((select private.current_user_has_active_profile()))',
      table_name || '_authenticated_read', table_name
    );
  end loop;
end $$;

drop policy service_prices_authorized_read on public.service_prices;
create policy service_prices_authorized_read on public.service_prices for select to authenticated
  using ((select private.current_user_has_any_role(array['admin', 'direction', 'reception', 'billing']::public.app_role[])));
drop policy form_template_versions_authorized_read on public.form_template_versions;
create policy form_template_versions_authorized_read on public.form_template_versions for select to authenticated
  using ((select private.current_user_has_any_role(array['admin', 'direction', 'doctor', 'physiotherapist', 'movement_professional']::public.app_role[])));
drop policy term_template_versions_authorized_read on public.term_template_versions;
create policy term_template_versions_authorized_read on public.term_template_versions for select to authenticated
  using ((select private.current_user_has_any_role(array['admin', 'direction', 'doctor', 'physiotherapist', 'movement_professional']::public.app_role[])));

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
    execute format('drop policy %I on public.%I', table_name || '_admin_insert', table_name);
    execute format('drop policy %I on public.%I', table_name || '_admin_update', table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.current_user_has_role(''admin'')))',
      table_name || '_admin_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.current_user_has_role(''admin''))) with check ((select private.current_user_has_role(''admin'')))',
      table_name || '_admin_update', table_name
    );
  end loop;
end $$;

drop policy service_prices_admin_insert on public.service_prices;
create policy service_prices_admin_insert on public.service_prices for insert to authenticated
  with check ((select private.current_user_has_role('admin')));
drop policy service_prices_admin_update on public.service_prices;
create policy service_prices_admin_update on public.service_prices for update to authenticated
  using ((select private.current_user_has_role('admin')))
  with check ((select private.current_user_has_role('admin')));

drop policy regulatory_authorities_authenticated_read on public.regulatory_authorities;
create policy regulatory_authorities_authenticated_read on public.regulatory_authorities for select to authenticated
  using ((select private.current_user_has_active_profile()));
drop policy specialty_catalog_releases_authenticated_read on public.specialty_catalog_releases;
create policy specialty_catalog_releases_authenticated_read on public.specialty_catalog_releases for select to authenticated
  using ((select private.current_user_has_active_profile()));
drop policy specialty_prerequisites_authenticated_read on public.specialty_prerequisites;
create policy specialty_prerequisites_authenticated_read on public.specialty_prerequisites for select to authenticated
  using ((select private.current_user_has_active_profile()));
drop policy specialty_registrations_authenticated_read on public.specialty_registrations;
create policy specialty_registrations_authenticated_read on public.specialty_registrations for select to authenticated
  using ((select private.current_user_has_active_profile()));

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'regulatory_authorities', 'specialty_catalog_releases',
    'specialty_prerequisites', 'specialty_registrations'
  ] loop
    execute format('drop policy %I on public.%I', table_name || '_admin_insert', table_name);
    execute format('drop policy %I on public.%I', table_name || '_admin_update', table_name);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.current_user_has_role(''admin'')))',
      table_name || '_admin_insert', table_name
    );
    execute format(
      'create policy %I on public.%I for update to authenticated using ((select private.current_user_has_role(''admin''))) with check ((select private.current_user_has_role(''admin'')))',
      table_name || '_admin_update', table_name
    );
  end loop;
end $$;

create or replace function private.prepare_profile_role_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_by := (select auth.uid());
  end if;
  new.updated_at := now();
  new.updated_by := (select auth.uid());
  return new;
end;
$$;
revoke all on function private.prepare_profile_role_change() from public, anon, authenticated;

create or replace function private.audit_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return new;
  end if;
  insert into public.audit_events (actor_id, action, entity_type, entity_id, metadata)
  values (
    (select auth.uid()),
    case when tg_op = 'INSERT' then 'assign' when new.active then 'reactivate' else 'revoke' end,
    'profile_roles',
    new.user_id::text || ':' || new.role::text,
    jsonb_build_object('role', new.role, 'active', new.active, 'source', 'database_trigger')
  );
  return new;
end;
$$;
revoke all on function private.audit_profile_role_change() from public, anon, authenticated;

create trigger profile_roles_prepare_change
before insert or update on public.profile_roles
for each row execute function private.prepare_profile_role_change();

create trigger profile_roles_audit
after insert or update on public.profile_roles
for each row execute function private.audit_profile_role_change();

create or replace function private.bootstrap_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profile_roles (user_id, role, active, created_by, updated_by)
  values (new.user_id, new.role, true, (select auth.uid()), (select auth.uid()))
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;
revoke all on function private.bootstrap_profile_role() from public, anon, authenticated;

create trigger profiles_bootstrap_role
after insert on public.profiles
for each row execute function private.bootstrap_profile_role();

-- Compatibilidade temporária: a função antiga deixa de autorizar e não deve ser usada por código novo.
create or replace function private.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select pr.role
  from public.profiles p
  join public.profile_roles pr on pr.user_id = p.user_id
  where p.user_id = (select auth.uid())
    and p.active = true
    and pr.active = true
  order by case pr.role
    when 'admin' then 1
    when 'direction' then 2
    else 3
  end, pr.role
  limit 1
$$;
