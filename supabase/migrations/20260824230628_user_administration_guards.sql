grant insert on table public.profiles to authenticated;

create policy "admins insert profiles" on public.profiles for insert to authenticated
  with check ((select private.current_user_has_role('admin')));

create or replace function private.protect_last_active_admin_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'admin' and old.active = true and new.active = false
    and not exists (
      select 1
      from public.profile_roles pr
      join public.profiles p on p.user_id = pr.user_id
      where pr.role = 'admin'
        and pr.active = true
        and p.active = true
        and pr.user_id <> old.user_id
    ) then
    raise exception 'A clínica deve manter ao menos um administrador ativo.';
  end if;
  return new;
end;
$$;
revoke all on function private.protect_last_active_admin_role() from public, anon, authenticated;

create trigger profile_roles_protect_last_admin
before update on public.profile_roles
for each row execute function private.protect_last_active_admin_role();

create or replace function private.protect_last_active_admin_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.active = true and new.active = false
    and exists (
      select 1 from public.profile_roles
      where user_id = old.user_id and role = 'admin' and active = true
    )
    and not exists (
      select 1
      from public.profile_roles pr
      join public.profiles p on p.user_id = pr.user_id
      where pr.role = 'admin'
        and pr.active = true
        and p.active = true
        and pr.user_id <> old.user_id
    ) then
    raise exception 'A clínica deve manter ao menos um administrador ativo.';
  end if;
  return new;
end;
$$;
revoke all on function private.protect_last_active_admin_profile() from public, anon, authenticated;

create trigger profiles_protect_last_admin
before update of active on public.profiles
for each row execute function private.protect_last_active_admin_profile();

create or replace function private.audit_profile_access_change()
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
    case when tg_op = 'INSERT' then 'create' else 'update' end,
    'profiles',
    new.user_id::text,
    jsonb_build_object(
      'active', new.active,
      'professional_id', new.professional_id,
      'source', 'database_trigger'
    )
  );
  return new;
end;
$$;
revoke all on function private.audit_profile_access_change() from public, anon, authenticated;

create trigger profiles_access_audit
after insert or update of active, professional_id, full_name on public.profiles
for each row execute function private.audit_profile_access_change();
