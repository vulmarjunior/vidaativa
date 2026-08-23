-- TASK-002: curated snapshots of the official CFM/CME and COFFITO specialty catalogs.
-- Sources are stored in specialty_catalog_releases; no runtime scraping is used.

insert into public.professions (name)
select source.name
from (values ('Medicina'), ('Fisioterapia')) as source(name)
where not exists (
  select 1 from public.professions existing where lower(existing.name) = lower(source.name)
);

insert into public.professional_councils (name, acronym)
select source.name, source.acronym
from (values
  ('Conselho Regional de Medicina', 'CRM'),
  ('Conselho Regional de Fisioterapia e Terapia Ocupacional', 'CREFITO')
) as source(name, acronym)
where not exists (
  select 1 from public.professional_councils existing
  where upper(existing.acronym) = upper(source.acronym)
);

do $$
declare
  medicine_id uuid;
  physiotherapy_id uuid;
  cfm_id uuid;
  coffito_id uuid;
  cfm_release_id uuid;
  coffito_release_id uuid;
begin
  select id into strict medicine_id from public.professions where lower(name) = lower('Medicina');
  select id into strict physiotherapy_id from public.professions where lower(name) = lower('Fisioterapia');
  select id into strict cfm_id from public.regulatory_authorities where upper(acronym) = 'CFM';
  select id into strict coffito_id from public.regulatory_authorities where upper(acronym) = 'COFFITO';

  insert into public.specialty_catalog_releases (
    regulatory_authority_id, profession_id, title, version_label, source_url,
    published_on, effective_from, active
  ) values (
    cfm_id, medicine_id, 'Especialidades e áreas de atuação médicas', 'CFM-2380-2024',
    'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2024/2380_2024.pdf',
    date '2024-06-24', date '2024-06-24', true
  )
  on conflict (regulatory_authority_id, profession_id, version_label)
  do update set title = excluded.title, source_url = excluded.source_url,
    published_on = excluded.published_on, effective_from = excluded.effective_from,
    active = excluded.active
  returning id into cfm_release_id;

  insert into public.specialty_catalog_releases (
    regulatory_authority_id, profession_id, title, version_label, source_url,
    published_on, effective_from, active
  ) values (
    coffito_id, physiotherapy_id, 'Especialidades e áreas de atuação da Fisioterapia',
    'COFFITO-636-2025', 'https://www.coffito.gov.br/nsite/?p=36272',
    date '2025-11-17', date '2025-11-17', true
  )
  on conflict (regulatory_authority_id, profession_id, version_label)
  do update set title = excluded.title, source_url = excluded.source_url,
    published_on = excluded.published_on, effective_from = excluded.effective_from,
    active = excluded.active
  returning id into coffito_release_id;

  insert into public.specialties (
    name, profession_id, catalog_release_id, official_code, classification,
    official, effective_from, effective_until, active
  )
  select catalog.name, medicine_id, cfm_release_id, null, catalog.classification,
    true, date '2024-06-24', null, true
  from (values
    ('Acupuntura','specialty'), ('Alergia e imunologia','specialty'),
    ('Anestesiologia','specialty'), ('Angiologia','specialty'), ('Cardiologia','specialty'),
    ('Cirurgia cardiovascular','specialty'), ('Cirurgia da mão','specialty'),
    ('Cirurgia de cabeça e pescoço','specialty'), ('Cirurgia do aparelho digestivo','specialty'),
    ('Cirurgia geral','specialty'), ('Cirurgia oncológica','specialty'),
    ('Cirurgia pediátrica','specialty'), ('Cirurgia plástica','specialty'),
    ('Cirurgia torácica','specialty'), ('Cirurgia vascular','specialty'),
    ('Clínica médica','specialty'), ('Coloproctologia','specialty'), ('Dermatologia','specialty'),
    ('Endocrinologia e metabologia','specialty'), ('Endoscopia','specialty'),
    ('Gastroenterologia','specialty'), ('Genética médica','specialty'), ('Geriatria','specialty'),
    ('Ginecologia e obstetrícia','specialty'), ('Hematologia e hemoterapia','specialty'),
    ('Homeopatia','specialty'), ('Infectologia','specialty'), ('Mastologia','specialty'),
    ('Medicina de emergência','specialty'), ('Medicina de família e comunidade','specialty'),
    ('Medicina do trabalho','specialty'), ('Medicina do tráfego','specialty'),
    ('Medicina esportiva','specialty'), ('Medicina física e reabilitação','specialty'),
    ('Medicina intensiva','specialty'), ('Medicina legal e perícia médica','specialty'),
    ('Medicina nuclear','specialty'), ('Medicina preventiva e social','specialty'),
    ('Nefrologia','specialty'), ('Neurocirurgia','specialty'), ('Neurologia','specialty'),
    ('Nutrologia','specialty'), ('Oftalmologia','specialty'), ('Oncologia clínica','specialty'),
    ('Ortopedia e traumatologia','specialty'), ('Otorrinolaringologia','specialty'),
    ('Patologia','specialty'), ('Patologia clínica/medicina laboratorial','specialty'),
    ('Pediatria','specialty'), ('Pneumologia','specialty'), ('Psiquiatria','specialty'),
    ('Radiologia e diagnóstico por imagem','specialty'), ('Radioterapia','specialty'),
    ('Reumatologia','specialty'), ('Urologia','specialty'),
    ('Administração em saúde','area_of_practice'),
    ('Alergia e imunologia pediátrica','area_of_practice'),
    ('Angiorradiologia e cirurgia endovascular','area_of_practice'),
    ('Atendimento ao queimado','area_of_practice'), ('Auditoria médica','area_of_practice'),
    ('Cardiologia pediátrica','area_of_practice'), ('Cirurgia bariátrica','area_of_practice'),
    ('Cirurgia crânio-maxilo-facial','area_of_practice'), ('Cirurgia do trauma','area_of_practice'),
    ('Cirurgia videolaparoscópica','area_of_practice'), ('Citopatologia','area_of_practice'),
    ('Densitometria óssea','area_of_practice'), ('Dor','area_of_practice'),
    ('Ecocardiografia','area_of_practice'), ('Ecografia vascular com doppler','area_of_practice'),
    ('Eletrofisiologia clínica invasiva','area_of_practice'),
    ('Emergência pediátrica','area_of_practice'), ('Endocrinologia pediátrica','area_of_practice'),
    ('Endoscopia digestiva','area_of_practice'), ('Endoscopia ginecológica','area_of_practice'),
    ('Endoscopia respiratória','area_of_practice'), ('Ergometria','area_of_practice'),
    ('Estimulação cardíaca eletrônica implantável','area_of_practice'),
    ('Foniatria','area_of_practice'), ('Gastroenterologia pediátrica','area_of_practice'),
    ('Hansenologia','area_of_practice'),
    ('Hematologia e hemoterapia pediátrica','area_of_practice'),
    ('Hemodinâmica e cardiologia intervencionista','area_of_practice'),
    ('Hepatologia','area_of_practice'), ('Infectologia hospitalar','area_of_practice'),
    ('Infectologia pediátrica','area_of_practice'), ('Mamografia','area_of_practice'),
    ('Medicina aeroespacial','area_of_practice'), ('Medicina do adolescente','area_of_practice'),
    ('Medicina do sono','area_of_practice'), ('Medicina fetal','area_of_practice'),
    ('Medicina intensiva pediátrica','area_of_practice'), ('Medicina paliativa','area_of_practice'),
    ('Medicina tropical','area_of_practice'), ('Nefrologia pediátrica','area_of_practice'),
    ('Neonatologia','area_of_practice'), ('Neurofisiologia clínica','area_of_practice'),
    ('Neurologia pediátrica','area_of_practice'), ('Neurorradiologia','area_of_practice'),
    ('Nutrição parenteral e enteral','area_of_practice'),
    ('Nutrição parenteral e enteral pediátrica','area_of_practice'),
    ('Nutrologia pediátrica','area_of_practice'), ('Oncogenética','area_of_practice'),
    ('Oncologia pediátrica','area_of_practice'), ('Pneumologia pediátrica','area_of_practice'),
    ('Psicogeriatria','area_of_practice'), ('Psicoterapia','area_of_practice'),
    ('Psiquiatria da infância e adolescência','area_of_practice'),
    ('Psiquiatria forense','area_of_practice'),
    ('Radiologia intervencionista e angiorradiologia','area_of_practice'),
    ('Reprodução assistida','area_of_practice'), ('Reumatologia pediátrica','area_of_practice'),
    ('Sexologia','area_of_practice'), ('Toxicologia médica','area_of_practice'),
    ('Transplante de medula óssea','area_of_practice'),
    ('Ultrassonografia em ginecologia e obstetrícia','area_of_practice'),
    ('Ultrassonografia geral','area_of_practice')
  ) as catalog(name, classification)
  on conflict (profession_id, lower(name)) where profession_id is not null
  do update set catalog_release_id = excluded.catalog_release_id,
    official_code = excluded.official_code, classification = excluded.classification,
    official = excluded.official, effective_from = excluded.effective_from,
    effective_until = excluded.effective_until, active = excluded.active;

  insert into public.specialties (
    name, profession_id, catalog_release_id, official_code, classification,
    official, effective_from, effective_until, active
  )
  select catalog.name, physiotherapy_id, coffito_release_id, catalog.code,
    catalog.classification, true, catalog.effective_from, catalog.effective_until,
    catalog.effective_until is null or catalog.effective_until >= current_date
  from (values
    ('Fisioterapia em Acupuntura','01','specialty',date '2025-11-17',null::date),
    ('Fisioterapia Respiratória','02','specialty',date '2025-11-17',null),
    ('Fisioterapia Neurofuncional','03','specialty',date '2025-11-17',null),
    ('Fisioterapia em Osteopatia','04','specialty',date '2025-11-17',null),
    ('Fisioterapia em Quiropraxia','05','specialty',date '2025-11-17',null),
    ('Fisioterapia Traumato-Ortopédica','06','specialty',date '2025-11-17',null),
    ('Fisioterapia Esportiva','07','specialty',date '2025-11-17',null),
    ('Fisioterapia do Trabalho','08','specialty',date '2025-11-17',null),
    ('Fisioterapia Dermatofuncional','09','specialty',date '2025-11-17',null),
    ('Fisioterapia em Saúde da Mulher','10','specialty',date '2025-11-17',null),
    ('Fisioterapia em Oncologia','11','specialty',date '2025-11-17',null),
    ('Fisioterapia em Terapia Intensiva','12','specialty',date '2025-11-17',null),
    ('Fisioterapia Aquática','13','specialty',date '2025-11-17',null),
    ('Fisioterapia Cardiovascular','14','specialty',date '2025-11-17',null),
    ('Fisioterapia em Gerontologia','15','specialty',date '2025-11-17',null),
    ('Fisioterapia em Reumatologia','16','specialty',date '2025-11-17',null),
    ('Fisioterapia Neurofuncional — Infância e Adolescência','03.1','area_of_practice',date '2025-11-17',null),
    ('Fisioterapia Neurofuncional — Adulto e Idoso','03.2','area_of_practice',date '2025-11-17',null),
    ('Fisioterapia Neurofuncional — Vestibular','03.3','area_of_practice',date '2025-11-17',null),
    ('Fisioterapia em Terapia Intensiva — Neonatologia e Pediatria','12.1','area_of_practice',date '2025-11-17',date '2025-12-31'),
    ('Fisioterapia em Terapia Intensiva — Adulto','12.2','area_of_practice',date '2025-11-17',null),
    ('Fisioterapia em Terapia Intensiva — Neonatologia','12.3','area_of_practice',date '2026-01-01',null),
    ('Fisioterapia em Terapia Intensiva — Pediatria','12.4','area_of_practice',date '2026-01-01',null)
  ) as catalog(name, code, classification, effective_from, effective_until)
  on conflict (profession_id, lower(name)) where profession_id is not null
  do update set catalog_release_id = excluded.catalog_release_id,
    official_code = excluded.official_code, classification = excluded.classification,
    official = excluded.official, effective_from = excluded.effective_from,
    effective_until = excluded.effective_until, active = excluded.active;

  insert into public.specialty_prerequisites (specialty_id, prerequisite_specialty_id)
  select area.id, prerequisite.id
  from (values
    ('Alergia e imunologia pediátrica','Alergia e imunologia'),
    ('Alergia e imunologia pediátrica','Pediatria'),
    ('Angiorradiologia e cirurgia endovascular','Angiologia'),
    ('Angiorradiologia e cirurgia endovascular','Cirurgia vascular'),
    ('Angiorradiologia e cirurgia endovascular','Radiologia e diagnóstico por imagem'),
    ('Atendimento ao queimado','Cirurgia plástica'),
    ('Cardiologia pediátrica','Cardiologia'), ('Cardiologia pediátrica','Pediatria'),
    ('Cirurgia bariátrica','Cirurgia do aparelho digestivo'), ('Cirurgia bariátrica','Cirurgia geral'),
    ('Cirurgia crânio-maxilo-facial','Cirurgia de cabeça e pescoço'),
    ('Cirurgia crânio-maxilo-facial','Cirurgia plástica'),
    ('Cirurgia crânio-maxilo-facial','Otorrinolaringologia'),
    ('Cirurgia do trauma','Cirurgia geral'),
    ('Cirurgia videolaparoscópica','Cirurgia do aparelho digestivo'),
    ('Cirurgia videolaparoscópica','Cirurgia geral'), ('Citopatologia','Patologia'),
    ('Densitometria óssea','Endocrinologia e metabologia'),
    ('Densitometria óssea','Ginecologia e obstetrícia'), ('Densitometria óssea','Medicina nuclear'),
    ('Densitometria óssea','Ortopedia e traumatologia'), ('Densitometria óssea','Reumatologia'),
    ('Dor','Acupuntura'), ('Dor','Anestesiologia'), ('Dor','Clínica médica'),
    ('Dor','Medicina física e reabilitação'), ('Dor','Neurocirurgia'), ('Dor','Neurologia'),
    ('Dor','Ortopedia e traumatologia'), ('Dor','Pediatria'), ('Dor','Reumatologia'),
    ('Ecocardiografia','Cardiologia'), ('Ecografia vascular com doppler','Angiologia'),
    ('Ecografia vascular com doppler','Cirurgia vascular'),
    ('Ecografia vascular com doppler','Radiologia e diagnóstico por imagem'),
    ('Eletrofisiologia clínica invasiva','Cardiologia'),
    ('Emergência pediátrica','Medicina de emergência'), ('Emergência pediátrica','Pediatria'),
    ('Endocrinologia pediátrica','Endocrinologia e metabologia'),
    ('Endocrinologia pediátrica','Pediatria'), ('Endoscopia digestiva','Endoscopia'),
    ('Endoscopia digestiva','Cirurgia do aparelho digestivo'),
    ('Endoscopia digestiva','Gastroenterologia'), ('Endoscopia digestiva','Coloproctologia'),
    ('Endoscopia digestiva','Cirurgia geral'),
    ('Endoscopia ginecológica','Ginecologia e obstetrícia'),
    ('Endoscopia respiratória','Cirurgia torácica'), ('Endoscopia respiratória','Pneumologia'),
    ('Ergometria','Cardiologia'), ('Estimulação cardíaca eletrônica implantável','Cardiologia'),
    ('Estimulação cardíaca eletrônica implantável','Cirurgia cardiovascular'),
    ('Foniatria','Otorrinolaringologia'), ('Gastroenterologia pediátrica','Gastroenterologia'),
    ('Gastroenterologia pediátrica','Pediatria'), ('Hansenologia','Clínica médica'),
    ('Hansenologia','Dermatologia'), ('Hansenologia','Infectologia'),
    ('Hansenologia','Medicina preventiva e social'),
    ('Hansenologia','Medicina de família e comunidade'), ('Hansenologia','Neurologia'),
    ('Hematologia e hemoterapia pediátrica','Hematologia e hemoterapia'),
    ('Hematologia e hemoterapia pediátrica','Pediatria'),
    ('Hemodinâmica e cardiologia intervencionista','Cardiologia'),
    ('Hepatologia','Clínica médica'), ('Hepatologia','Gastroenterologia'),
    ('Hepatologia','Infectologia'), ('Infectologia hospitalar','Infectologia'),
    ('Infectologia pediátrica','Infectologia'), ('Infectologia pediátrica','Pediatria'),
    ('Mamografia','Ginecologia e obstetrícia'), ('Mamografia','Mastologia'),
    ('Medicina aeroespacial','Clínica médica'), ('Medicina aeroespacial','Medicina intensiva'),
    ('Medicina aeroespacial','Medicina de emergência'), ('Medicina aeroespacial','Cirurgia geral'),
    ('Medicina aeroespacial','Pediatria'), ('Medicina aeroespacial','Anestesiologia'),
    ('Medicina aeroespacial','Cardiologia'), ('Medicina aeroespacial','Cirurgia pediátrica'),
    ('Medicina aeroespacial','Medicina do trabalho'), ('Medicina aeroespacial','Medicina do tráfego'),
    ('Medicina aeroespacial','Ortopedia e traumatologia'),
    ('Medicina aeroespacial','Otorrinolaringologia'), ('Medicina aeroespacial','Psiquiatria'),
    ('Medicina do adolescente','Pediatria'), ('Medicina do sono','Cardiologia'),
    ('Medicina do sono','Clínica médica'), ('Medicina do sono','Neurologia'),
    ('Medicina do sono','Otorrinolaringologia'), ('Medicina do sono','Pediatria'),
    ('Medicina do sono','Pneumologia'), ('Medicina do sono','Psiquiatria'),
    ('Medicina fetal','Ginecologia e obstetrícia'),
    ('Medicina intensiva pediátrica','Medicina intensiva'),
    ('Medicina intensiva pediátrica','Pediatria'), ('Medicina paliativa','Anestesiologia'),
    ('Medicina paliativa','Cirurgia de cabeça e pescoço'),
    ('Medicina paliativa','Cirurgia oncológica'), ('Medicina paliativa','Clínica médica'),
    ('Medicina paliativa','Geriatria'), ('Medicina paliativa','Mastologia'),
    ('Medicina paliativa','Medicina de família e comunidade'),
    ('Medicina paliativa','Medicina intensiva'), ('Medicina paliativa','Neurologia'),
    ('Medicina paliativa','Nefrologia'), ('Medicina paliativa','Oncologia clínica'),
    ('Medicina paliativa','Pediatria'), ('Medicina tropical','Infectologia'),
    ('Nefrologia pediátrica','Nefrologia'), ('Nefrologia pediátrica','Pediatria'),
    ('Neonatologia','Pediatria'), ('Neurofisiologia clínica','Medicina física e reabilitação'),
    ('Neurofisiologia clínica','Neurologia'), ('Neurofisiologia clínica','Neurocirurgia'),
    ('Neurofisiologia clínica','Pediatria'), ('Neurologia pediátrica','Neurologia'),
    ('Neurologia pediátrica','Pediatria'),
    ('Neurorradiologia','Radiologia e diagnóstico por imagem'),
    ('Neurorradiologia','Neurologia'), ('Neurorradiologia','Neurocirurgia'),
    ('Nutrição parenteral e enteral','Cirurgia geral'),
    ('Nutrição parenteral e enteral','Cirurgia do aparelho digestivo'),
    ('Nutrição parenteral e enteral','Clínica médica'),
    ('Nutrição parenteral e enteral','Gastroenterologia'),
    ('Nutrição parenteral e enteral','Medicina intensiva'),
    ('Nutrição parenteral e enteral','Nutrologia'),
    ('Nutrição parenteral e enteral','Pediatria'),
    ('Nutrição parenteral e enteral pediátrica','Nutrologia'),
    ('Nutrição parenteral e enteral pediátrica','Pediatria'),
    ('Nutrologia pediátrica','Nutrologia'), ('Nutrologia pediátrica','Pediatria'),
    ('Oncogenética','Cirurgia de cabeça e pescoço'), ('Oncogenética','Cirurgia oncológica'),
    ('Oncogenética','Coloproctologia'), ('Oncogenética','Genética médica'),
    ('Oncogenética','Hematologia e hemoterapia'), ('Oncogenética','Mastologia'),
    ('Oncogenética','Neurologia'), ('Oncogenética','Oncologia clínica'),
    ('Oncogenética','Patologia clínica/medicina laboratorial'), ('Oncogenética','Radioterapia'),
    ('Oncologia pediátrica','Hematologia e hemoterapia'),
    ('Oncologia pediátrica','Oncologia clínica'), ('Oncologia pediátrica','Pediatria'),
    ('Pneumologia pediátrica','Pediatria'), ('Pneumologia pediátrica','Pneumologia'),
    ('Psicogeriatria','Psiquiatria'), ('Psicoterapia','Psiquiatria'),
    ('Psiquiatria da infância e adolescência','Psiquiatria'), ('Psiquiatria forense','Psiquiatria'),
    ('Radiologia intervencionista e angiorradiologia','Angiologia'),
    ('Radiologia intervencionista e angiorradiologia','Cirurgia vascular'),
    ('Radiologia intervencionista e angiorradiologia','Radiologia e diagnóstico por imagem'),
    ('Reprodução assistida','Ginecologia e obstetrícia'),
    ('Reumatologia pediátrica','Reumatologia'), ('Reumatologia pediátrica','Pediatria'),
    ('Sexologia','Ginecologia e obstetrícia'), ('Sexologia','Psiquiatria'),
    ('Toxicologia médica','Clínica médica'), ('Toxicologia médica','Medicina intensiva'),
    ('Toxicologia médica','Medicina do trabalho'), ('Toxicologia médica','Pediatria'),
    ('Toxicologia médica','Pneumologia'),
    ('Transplante de medula óssea','Hematologia e hemoterapia'),
    ('Ultrassonografia em ginecologia e obstetrícia','Ginecologia e obstetrícia'),
    ('Ultrassonografia geral','Clínica médica'), ('Ultrassonografia geral','Cirurgia geral'),
    ('Ultrassonografia geral','Ginecologia e obstetrícia'), ('Ultrassonografia geral','Pediatria'),
    ('Ultrassonografia geral','Medicina de emergência'),
    ('Ultrassonografia geral','Medicina intensiva'), ('Ultrassonografia geral','Angiologia'),
    ('Ultrassonografia geral','Cirurgia vascular'),
    ('Ultrassonografia geral','Medicina de família e comunidade'),
    ('Ultrassonografia geral','Medicina preventiva e social')
  ) as requirement(area_name, prerequisite_name)
  join public.specialties area
    on area.profession_id = medicine_id and lower(area.name) = lower(requirement.area_name)
  join public.specialties prerequisite
    on prerequisite.profession_id = medicine_id
    and lower(prerequisite.name) = lower(requirement.prerequisite_name)
  on conflict do nothing;

  insert into public.specialty_prerequisites (specialty_id, prerequisite_specialty_id)
  select area.id, prerequisite.id
  from (values
    ('Fisioterapia Neurofuncional — Infância e Adolescência','Fisioterapia Neurofuncional'),
    ('Fisioterapia Neurofuncional — Adulto e Idoso','Fisioterapia Neurofuncional'),
    ('Fisioterapia Neurofuncional — Vestibular','Fisioterapia Neurofuncional'),
    ('Fisioterapia em Terapia Intensiva — Neonatologia e Pediatria','Fisioterapia em Terapia Intensiva'),
    ('Fisioterapia em Terapia Intensiva — Adulto','Fisioterapia em Terapia Intensiva'),
    ('Fisioterapia em Terapia Intensiva — Neonatologia','Fisioterapia em Terapia Intensiva'),
    ('Fisioterapia em Terapia Intensiva — Pediatria','Fisioterapia em Terapia Intensiva')
  ) as requirement(area_name, prerequisite_name)
  join public.specialties area
    on area.profession_id = physiotherapy_id and lower(area.name) = lower(requirement.area_name)
  join public.specialties prerequisite
    on prerequisite.profession_id = physiotherapy_id
    and lower(prerequisite.name) = lower(requirement.prerequisite_name)
  on conflict do nothing;
end
$$;
