create extension if not exists pgcrypto;

create type public.app_role as enum ('admin','direction','reception','billing','doctor','physiotherapist','movement_professional','support');

create table public.clinic_settings (
  singleton boolean primary key default true check (singleton), legal_name text not null, trade_name text not null,
  cnpj text, logo_url text, email text, phone text, whatsapp text, street text, number text, complement text,
  district text, city text, state char(2), postal_code text, primary_color text not null default '#176b87',
  secondary_color text not null default '#2a8c82', updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);
insert into public.clinic_settings (legal_name, trade_name, city, state) values ('Clínica Vida Ativa','Clínica Vida Ativa','Porto Velho','RO');

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete restrict, full_name text not null, role public.app_role not null,
  active boolean not null default true, professional_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(), actor_id uuid not null references auth.users(id) on delete restrict,
  action text not null, entity_type text not null, entity_id text, reason text, metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index audit_events_actor_id_idx on public.audit_events(actor_id);
create index audit_events_occurred_at_idx on public.audit_events(occurred_at desc);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create or replace function private.current_user_role() returns public.app_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where user_id = (select auth.uid()) and active = true
$$;
revoke all on function private.current_user_role() from public;
grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;

alter table public.clinic_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.audit_events enable row level security;
grant select, update on public.clinic_settings to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.audit_events to authenticated;

create policy "authenticated users read clinic settings" on public.clinic_settings for select to authenticated using (true);
create policy "management updates clinic settings" on public.clinic_settings for update to authenticated
  using ((select private.current_user_role()) in ('admin','direction')) with check ((select private.current_user_role()) in ('admin','direction'));
create policy "users read own profile or management reads all" on public.profiles for select to authenticated
  using (user_id = (select auth.uid()) or (select private.current_user_role()) in ('admin','direction'));
create policy "admins update profiles" on public.profiles for update to authenticated
  using ((select private.current_user_role()) = 'admin') with check ((select private.current_user_role()) = 'admin');
create policy "users insert own audit events" on public.audit_events for insert to authenticated with check (actor_id = (select auth.uid()));
create policy "management reads audit events" on public.audit_events for select to authenticated
  using ((select private.current_user_role()) in ('admin','direction'));
