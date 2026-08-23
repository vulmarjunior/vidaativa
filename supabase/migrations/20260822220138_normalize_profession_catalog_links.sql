-- TASK-002: reconcile curated catalogs with the profession records created during setup.
-- Duplicate imported profession rows are retained inactive for historical safety.

insert into public.professions (name)
select source.name
from (values ('Médico'), ('Fisioterapeuta')) as source(name)
where not exists (
  select 1 from public.professions existing where lower(existing.name) = lower(source.name)
);

do $$
declare
  source_profession_id uuid;
  target_profession_id uuid;
  release_id uuid;
  catalog_entry_ids uuid[];
begin
  select id into source_profession_id from public.professions where lower(name) = lower('Medicina');
  select id into strict target_profession_id from public.professions where lower(name) = lower('Médico');
  select id into release_id from public.specialty_catalog_releases where version_label = 'CFM-2380-2024';

  if source_profession_id is not null and source_profession_id <> target_profession_id and release_id is not null then
    select coalesce(array_agg(id), array[]::uuid[]) into catalog_entry_ids
    from public.specialties where catalog_release_id = release_id;

    update public.specialties
      set catalog_release_id = null, official = false
      where id = any(catalog_entry_ids);
    update public.specialty_catalog_releases
      set profession_id = target_profession_id
      where id = release_id;
    update public.specialties
      set profession_id = target_profession_id, catalog_release_id = release_id, official = true
      where id = any(catalog_entry_ids);
    update public.professions set active = false where id = source_profession_id;
  end if;

  select id into source_profession_id from public.professions where lower(name) = lower('Fisioterapia');
  select id into strict target_profession_id from public.professions where lower(name) = lower('Fisioterapeuta');
  select id into release_id from public.specialty_catalog_releases where version_label = 'COFFITO-636-2025';

  if source_profession_id is not null and source_profession_id <> target_profession_id and release_id is not null then
    select coalesce(array_agg(id), array[]::uuid[]) into catalog_entry_ids
    from public.specialties where catalog_release_id = release_id;

    update public.specialties
      set catalog_release_id = null, official = false
      where id = any(catalog_entry_ids);
    update public.specialty_catalog_releases
      set profession_id = target_profession_id
      where id = release_id;
    update public.specialties
      set profession_id = target_profession_id, catalog_release_id = release_id, official = true
      where id = any(catalog_entry_ids);
    update public.professions set active = false where id = source_profession_id;
  end if;

  update public.professional_councils
    set name = 'Conselho Regional de Fisioterapia e Terapia Ocupacional'
    where upper(acronym) = 'CREFITO';
end
$$;
