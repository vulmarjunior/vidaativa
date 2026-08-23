# Módulo: Profissionais, serviços e recursos

Estado: Em implementação — tarefa ativa
PRD: seções 4, 5, 7 e 20

## Responsabilidade

Manter profissionais, vínculos, conselhos, especialidades, categorias, serviços, capacidades, atividades, durações, salas e recursos utilizados pela agenda, pelos futuros planos assistenciais e pelos repasses.

## Regras iniciais

- profissional inativo permanece no histórico;
- conselho e UF são obrigatórios quando aplicáveis;
- serviços definem duração padrão e recursos necessários;
- categorias e serviços são configuráveis e não limitados às modalidades atuais;
- novos serviços compatíveis usam capacidades existentes sem mudança de código;
- o serviço configura modalidade, capacidade, avaliação, plano, evolução, formulários, termos, cobrança e habilitações aplicáveis;
- atividades são reutilizáveis entre fisioterapia, musculação, fortalecimento, pilates e modalidades futuras;
- planos, fichas e execução por sessão terão núcleo comum, versionado e separado entre prescrito e realizado;
- dados de remuneração devem ter autorização mais restrita que dados operacionais;
- alterações relevantes devem ser auditadas.
- especialidade oficial e qualificação acadêmica são conceitos distintos;
- especialidades oficiais pertencem a catálogos regulatórios versionados, preservando fonte e vigência;
- o vínculo de uma especialidade ao profissional não comprova RQE; o registro e sua verificação são mantidos separadamente.

## Pendências de descoberta

- tipos de vínculo usados pela clínica;
- conselhos profissionais presentes;
- tabela real de serviços e durações;
- fichas de treino e tratamento existentes;
- atividades, exercícios, técnicas e parâmetros utilizados;
- fluxo de estética não invasiva, avaliações, contraindicações e termos;
- responsável e regras operacionais da musculação orientada para idosos;
- salas e equipamentos disponíveis;
- formas de remuneração e exceções por convênio/serviço.

## Implementação

Consulte `docs/tasks/active/TASK-002-profissionais-servicos-recursos.md`.

## ERD aprovado em 2026-08-22

O cadastro estrutural é organizado nos seguintes núcleos:

- profissionais: `professionals`, `professions`, `professional_councils`, `professional_registrations`, `specialties`, `professional_specialties`, `qualifications` e `professional_qualifications`;
- serviços: `service_categories`, `services`, `capabilities`, `service_capabilities`, `delivery_modes`, `service_delivery_modes`, `service_professionals`, `billing_modes`, `service_billing_modes` e `service_prices`;
- estrutura operacional: `rooms`, `resources`, `service_rooms` e `service_resources`;
- catálogo assistencial reutilizável: `activity_categories`, `activities`, `parameter_definitions`, `activity_parameters` e `activity_resources`;
- requisitos documentais: `form_templates`, `form_template_versions`, `service_forms`, `term_templates`, `term_template_versions` e `service_terms`.
- regulação profissional: `regulatory_authorities`, `specialty_catalog_releases`, campos regulatórios de `specialties`, `specialty_prerequisites` e `specialty_registrations`.

`profiles.professional_id` referencia `professionals.id`, mantendo conta de acesso e cadastro profissional como conceitos diferentes.

Planos assistenciais, suas versões, seções, itens prescritos, sessões e itens realizados permanecem fora da TASK-002. A futura estrutura deverá referenciar `services`, `professionals` e `activities`, preservar versões e manter atividade prescrita separada da realizada.

## Integridade e histórico

- cadastros operacionais são inativados, não excluídos pela aplicação;
- preços são registros temporais; valor e início da vigência são imutáveis pela API, permitindo apenas encerrar a vigência ou ajustar observação;
- duração, intervalo e capacidade podem ser sobrescritos na habilitação de um profissional para um serviço;
- conselho, UF e número de registro são exigidos em conjunto quando o conselho se aplica;
- categorias, capacidades, formas de atendimento e cobrança são dados configuráveis;
- parâmetros frequentes das atividades são relacionais e tipados;
- formulários e termos mantêm versões próprias.
- registros legados em `specialties` permanecem válidos sem classificação oficial até curadoria explícita;
- uma especialidade oficial deve apontar para profissão e release compatíveis;
- áreas de atuação podem declarar uma ou mais especialidades pré-requisito;
- `specialty_registrations` guarda RQE, conselho, UF, vigência, situação de verificação, fonte e responsável pela verificação;
- listas oficiais não são obtidas por raspagem em tempo de execução; cada importação deverá criar um release rastreável e preservar o histórico.

## Matriz inicial de autorização

| Grupo de dados | Admin | Direção | Recepção | Financeiro | Assistenciais | Suporte |
|---|---:|---:|---:|---:|---:|---:|
| Catálogo operacional | leitura/escrita | leitura | leitura | leitura | leitura | leitura |
| Preços | leitura/escrita | leitura | leitura | leitura | sem acesso | sem acesso |
| Conteúdo versionado de formulários e termos | leitura/escrita | leitura | sem acesso | sem acesso | leitura | sem acesso |

Todas as tabelas expostas possuem RLS. A aplicação não concede `DELETE`; alterações estruturais relevantes são registradas em `audit_events` por trigger.

## Interface implementada

- `/dashboard/cadastros`: profissionais, categorias, serviços, salas e recursos;
- `/dashboard/cadastros/estruturas`: profissões, conselhos, especialidades, qualificações, categorias de atividade e atividades;
- `/dashboard/cadastros/servicos/[id]`: capacidades, modalidade, cobrança, preço temporal, salas, recursos e profissionais habilitados.
- `/dashboard/cadastros/profissionais/[id]`: dados básicos, profissão e registros, conselho/UF condicionais, especialidades, qualificações, serviços habilitados e duração própria.

A ficha profissional não cria usuário automaticamente. Conselho, UF e número são opcionais em conjunto: ou os três são informados quando aplicáveis, ou permanecem vazios. Conta de acesso e dados financeiros continuam separados.

Em 2026-08-22, o serviço `Avaliação fisioterapêutica` foi configurado com capacidade `Avaliação`, modalidade `Individual`, `Sala de Fisioterapia` e `Maca de fisioterapia`. Cobrança, preço e profissional não foram presumidos.

## Catálogos regulatórios importados

- `CFM-2380-2024`: 55 especialidades médicas e 62 áreas de atuação, com 175 vínculos de pré-requisito derivados do anexo oficial;
- `COFFITO-636-2025`: 16 especialidades fisioterapêuticas, sete registros de áreas atuais/históricas e sete vínculos de pré-requisito;
- a área combinada de Terapia Intensiva em Neonatologia e Pediatria foi preservada como histórica até 2025; Neonatologia e Pediatria possuem entradas próprias a partir de 2026;
- `Médico` e `Fisioterapeuta` são as profissões canônicas; os registros importados duplicados `Medicina` e `Fisioterapia` permanecem inativos por segurança histórica;
- a tela estrutural apresenta profissão, classificação, código e release, mas não permite editar ou inativar entradas oficiais;
- para evitar uma tabela de 140 linhas na página, o catálogo estrutural usa resumo compacto e gaveta lateral com busca e filtros por profissão e tipo;
- a ficha profissional filtra o catálogo por profissão ativa, exige pré-requisitos e mantém o RQE pendente até conferência administrativa com fonte oficial.
