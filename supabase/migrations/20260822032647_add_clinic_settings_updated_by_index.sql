create index clinic_settings_updated_by_idx
  on public.clinic_settings (updated_by)
  where updated_by is not null;
