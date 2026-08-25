# TASK-002 — Profissionais, serviços, salas e recursos

Status: Em desenvolvimento
Prioridade: P0  
Módulo: Profissionais, serviços e recursos  
Dependências: fundação de perfis e auditoria  
Criada em: 2026-08-21

## Objetivo

Implementar os cadastros estruturantes necessários para agenda, prontuários e repasses.

## Escopo

- profissionais e situação ativa/inativa;
- dados de conselho profissional e UF;
- especialidades;
- categorias e serviços configuráveis, capacidades, duração e situação;
- catálogo reutilizável de atividades, exercícios, técnicas e procedimentos;
- salas e recursos/equipamentos;
- relações entre profissionais, especialidades e serviços;
- associações de serviços com profissionais, recursos, formulários, termos e formas de cobrança;
- desenho dos vínculos necessários para futuros planos assistenciais e fichas, sem implementar todo o prontuário nesta tarefa;
- autorização, RLS e auditoria;
- interfaces administrativas com busca e estados de interface.

## Fora do escopo

- agenda e disponibilidade;
- cálculo ou pagamento de repasses;
- assinatura digital;
- execução do atendimento clínico;
- CRUD completo de planos, fichas e sessões executadas;
- regras específicas de cobrança dos convênios.

## Questões de descoberta

- quais profissões e conselhos existem atualmente;
- se um profissional pode possuir mais de um conselho/especialidade;
- serviços reais, durações e necessidade de preparação/intervalo;
- fichas de treino e tratamento atualmente utilizadas;
- atividades e parâmetros comuns de fisioterapia, musculação, fortalecimento e pilates;
- profissionais habilitados e fluxo da estética não invasiva;
- profissional responsável e funcionamento da musculação orientada para idosos;
- salas e equipamentos compartilháveis;
- quais dados financeiros podem ser vistos por direção, financeiro e profissional.

Na ausência de resposta, modele de forma normalizada e configurável, sem inventar regras financeiras.

## Critérios de aceite

- [ ] modelo de dados documentado;
- [ ] categorias e serviços podem ser acrescentados sem enum rígido ou nova tabela por modalidade;
- [ ] modelo reserva relações estáveis para atividades e planos versionados futuros;
- [ ] migrations incrementais criadas, sem alterar a migration inicial;
- [ ] integridade, índices e RLS implementados;
- [ ] matriz de autorização documentada e testada;
- [ ] eventos relevantes auditados;
- [ ] CRUD administrativo funcional e responsivo;
- [ ] exclusão física impedida quando houver risco histórico;
- [ ] estados de carregamento, vazio, erro e permissão tratados;
- [x] lint, TypeScript e build aprovados;
- [ ] fluxo verificado no navegador;
- [x] documentação e registros atualizados.

## Progresso

- [x] consolidar no PRD a extensibilidade de serviços, estética, musculação e planos assistenciais;
- [x] confirmar modelo conceitual com o PRD;
- [x] produzir e revisar ERD antes da migration;
- [x] criar migration;
- [x] criar consultas e ações de servidor;
- [x] implementar profissionais e especialidades — ficha completa implementada; preenchimento aguarda dados reais;
- [x] implementar serviços — categoria, serviço, capacidades, modalidades, cobrança, preços, salas, recursos e habilitação profissional disponíveis;
- [x] implementar salas e recursos;
- [x] modelar catálogo oficial versionado de especialidades e registro separado de RQE;
- [x] importar e versionar catálogos oficiais CFM/CME e COFFITO;
- [x] integrar profissão, pré-requisitos e fluxo de verificação de RQE à ficha profissional;
- [ ] testar autorização e auditoria;
- [x] permitir múltiplos papéis ativos por conta, com migração do papel existente, RLS e auditoria;
- [x] implementar interface administrativa de usuários e convites, incluindo vínculo opcional ao profissional;
- [x] compactar a administração de usuários com busca, filtros, paginação visual, edição em painel lateral e descrições acessíveis dos papéis;
- [x] distinguir convite pendente, conta ativa e conta inativa e limitar exclusão ao cancelamento auditado de convite nunca confirmado;
- [x] documentar espaços de trabalho por capacidades e implementar navegação dinâmica para múltiplos papéis;
- [ ] verificar interface;
- [x] adicionar estados de rota para carregamento, erro inesperado com nova tentativa e cadastro dinâmico não encontrado;

## Arquivos previstos

- `supabase/migrations/`
- `src/app/(dashboard)/dashboard/`
- `src/lib/`
- `docs/modules/professionals-and-services.md`

## Dependência externa

O Supabase remoto está vinculado e contém as oito migrations, incluindo o modelo regulatório, os catálogos oficiais, múltiplos papéis e as proteções da administração de usuários. A Edge Function `admin-users` está publicada. Respostas da descoberta operacional ainda serão necessárias antes de consolidar regras específicas de vínculos, serviços, recursos e remuneração.

## Onde continuar

Retomar nesta ordem:

1. não alterar `sge-mordomo-db` (porta 5432); usar apenas o Supabase remoto ou o ambiente isolado `clinica-vida-ativa-task002-validation` (Postgres na porta 54322);
2. disponibilizar contas individuais de teste para recepção, financeiro, médico e fisioterapeuta; completar no navegador a matriz de autorização e confirmar os eventos correspondentes em `audit_events`;
3. quando houver dados reais da profissional, cadastrar profissão, conselho, UF e número de registro e validar visualmente a associação de especialidade/área, pré-requisitos e RQE, sem inventar informações;
4. concluir a revisão de acessibilidade e dos estados de carregamento, vazio, erro e permissão; a checagem responsiva básica em 390 px já passou nas três rotas administrativas principais;
5. obter da clínica os modelos reais e definir o escopo restante das interfaces de formulários e termos;
6. repetir reconstrução, RLS e auditoria no ambiente isolado quando o Docker Desktop estiver disponível e executar a validação final antes de encerrar a tarefa.

Em 2026-08-25, os estados de rota de carregamento, erro inesperado e cadastro não encontrado foram implementados no segmento de cadastros. Continuar a revisão pelos formulários, ações sensíveis e navegação por teclado; a validação visual desses novos estados ainda depende de ambiente configurado e navegador autenticado.

Também em 2026-08-25, a administração de usuários foi reorganizada em listagem compacta com busca e filtros, papéis resumidos, edição em `Sheet` e confirmação de cancelamento em `AlertDialog`. Contas confirmadas preservam histórico e só podem ser inativadas; apenas convites sem confirmação e sem login podem ser cancelados. Após nova autenticação da CLI, a Edge Function atualizada foi publicada no remoto em versão 2, estado `ACTIVE` e com verificação JWT habilitada.

Catálogos oficiais só devem ser atualizados por nova migration incremental, vinculada a release e fonte oficial conferida. Não presumir cobrança, preço, remuneração ou habilitação profissional para o serviço `Avaliação fisioterapêutica`.

## Pendências ao encerrar 2026-08-24

- dados reais da profissional para validar a ficha dinâmica e o fluxo completo de RQE;
- contas individuais de teste para recepção, financeiro, médico e fisioterapeuta;
- testes funcionais por perfil não administrativo e conferência da auditoria correspondente;
- Docker Desktop disponível para repetir os testes no ambiente isolado;
- revisão de acessibilidade e estados alternativos; responsividade básica das rotas principais verificada em 390 px;
- decisão e implementação das interfaces de formulários e termos;
- proteção contra senhas vazadas no Supabase Auth, condicionada à disponibilidade do plano.
- validar amanhã a navegação modular com contas individuais não administrativas e confirmar a união de módulos em uma conta com dois papéis.

## Validações

- em 2026-08-25, `npm run lint` e `npm run typecheck` passaram após a inclusão dos estados alternativos;
- em 2026-08-25, `npm run build` compilou dentro do sandbox, mas o processo auxiliar foi bloqueado por `spawn EPERM`; repetido fora do sandbox, o build de produção passou por completo com Next.js 16.3.2;
- em 2026-08-25, não havia `.env*`, contas de teste acessíveis ou comando Docker disponível; por isso a matriz funcional por perfil e a reconstrução isolada não foram executadas;
- em 2026-08-25, `npm run lint`, `npm run typecheck` e `npm run build` passaram após a reorganização da administração de usuários; o build precisou ser repetido fora do sandbox após `spawn EPERM`;
- em 2026-08-25, a tela autenticada foi validada no Chrome em desktop e viewport de 390 px, sem rolagem horizontal ou overlay; busca, filtros, painel de edição e confirmação de cancelamento foram exercitados sem submeter alterações;
- em 2026-08-25, uma primeira publicação de `admin-users` foi bloqueada com `403`; após autenticação com conta autorizada, o deploy passou e a função foi confirmada em versão 2, estado `ACTIVE` e `verify_jwt = true`;
- em 2026-08-25, o usuário confirmou que o cancelamento de convite pendente funcionou pela interface no ambiente remoto; a conferência isolada do evento `cancel_invite` em `audit_events` continua pendente de registro explícito;

- em 2026-08-24, a migration de múltiplos papéis reconstruiu as sete migrations desde zero no ambiente isolado;
- em 2026-08-24, testes transacionais confirmaram dois papéis ativos na mesma conta, união de permissões, revogação parcial sem perda do papel restante e eventos `assign`/`revoke` em `audit_events`; rollback executado;
- em 2026-08-24, uma conta não administrativa foi bloqueada pela RLS ao tentar atribuir `admin` a si própria;
- em 2026-08-24, lint e advisors locais não encontraram erros ou alertas após a migration; lint, TypeScript e build da aplicação passaram;
- em 2026-08-24, o dry-run remoto não acessou o banco porque a sessão da CLI expirou com `401 Unauthorized`; nenhuma migration foi aplicada remotamente;
- após reautenticação em 2026-08-24, o novo dry-run listou somente `20260824223735_allow_multiple_roles_per_user.sql`; a migration foi aplicada ao remoto com sucesso;
- histórico remoto confirmado com sete migrations alinhadas; lint remoto sem erros e advisors com apenas o alerta já conhecido `auth_leaked_password_protection`;
- em 2026-08-24, a interface `/dashboard/configuracoes/usuarios`, a Edge Function `admin-users` e o fluxo `/auth/set-password` foram implementados;
- reconstrução local com oito migrations, proteção do último administrador, auditoria de perfis, bundle da Edge Function e convite fictício com dois papéis foram aprovados; dados fictícios removidos por `db reset`;
- `npm run lint`, `npm run typecheck`, `npm run build`, lint e advisors locais passaram após a administração de usuários;
- a verificação com `agent-browser` não pôde ser executada porque o binário não está instalado no ambiente; o build e o teste funcional da Edge Function passaram;
- após reautenticação, a oitava migration foi aplicada e `admin-users` publicada no remoto em estado `ACTIVE`, versão 1 e com `verify_jwt = true`;
- o endpoint remoto passou de `404` para `401` sem sessão, confirmando publicação e proteção; oito migrations alinhadas, lint remoto sem erros e somente o advisor conhecido de senhas vazadas;

- em 2026-08-23, `/dashboard/cadastros`, `/dashboard/cadastros/estruturas` e `/dashboard/cadastros/servicos/[id]` carregaram autenticadas como administrador, sem alerta funcional; a mensagem transitória de indisponibilidade não se repetiu e nenhuma correção foi necessária;
- em 2026-08-23, as três rotas administrativas principais foram verificadas em viewport de 390 px, sem rolagem horizontal;
- em 2026-08-23, `npm run lint`, `npm run typecheck` e `npm run build` foram aprovados;
- em 2026-08-23, o Docker Desktop estava indisponível e não havia contas não administrativas na sessão; por isso, os testes finais por perfil e a repetição local de RLS/auditoria permanecem pendentes;

- `npx supabase start`: aprovado; criou o ambiente isolado `clinica-vida-ativa-task002-validation` e aplicou as três migrations sem erros.
- `npx supabase db lint --local --schema public --level warning --fail-on error`: aprovado, sem erros de esquema.
- `npx supabase migration list --local`: aprovado; as três migrations locais constam como aplicadas no ambiente isolado.
- testes RLS via `psql`: aprovados para escrita administrativa com auditoria, leitura da recepção, bloqueio de escrita da recepção e ocultação de preços para médico; dados fictícios removidos.
- `npx supabase db advisors --local --type all --level warn --fail-on error`: aprovado, sem alertas.
- autenticação da CLI Supabase: concluída pelo fluxo oficial com código de verificação.
- `npx supabase db push --linked --dry-run --skip-vault`: aprovado; indicou somente a migration da TASK-002.
- `npx supabase db push --linked --skip-vault --yes`: aprovado; migration aplicada ao Supabase remoto.
- `npx supabase migration list --linked`: aprovado; migrations local e remota coincidem.
- `npx supabase db lint --linked --schema public --level warning --fail-on error`: aprovado sem erros.
- `npx supabase db advisors --linked --type all --level warn --fail-on error`: apenas o alerta já conhecido de proteção contra senhas vazadas desabilitada.
- navegador sem sessão: `/dashboard/cadastros` redireciona para `/login?redirect=/dashboard/cadastros`, sem overlay ou erros de console.
- navegador com administrador: `/dashboard/cadastros`, `/dashboard/cadastros/estruturas` e `/dashboard/cadastros/servicos/[id]` carregaram sem overlay ou erros de console.
- associações verificadas no remoto: capacidade `Avaliação`, modalidade `Individual`, `Sala de Fisioterapia` e `Maca de fisioterapia` no serviço `Avaliação fisioterapêutica`.
- `npm run lint`, `npm run typecheck` e `npm run build`: aprovados após as novas rotas e ações.
- ficha profissional: lint, TypeScript e build aprovados; tela principal verificada autenticada sem erros. A rota dinâmica não recebeu dados fictícios no remoto apenas para teste.
- migration regulatória `20260822210413_official_specialty_catalog_and_rqe.sql` criada pela CLI oficial após aprovação do ERD incremental.
- `npx supabase db reset --local --no-seed`: aprovado no ambiente isolado; as quatro migrations foram aplicadas do zero sem acessar `sge-mordomo-db`.
- testes transacionais de integridade/RLS: aprovados para RQE vinculado, rejeição de profissão incompatível, leitura da recepção e bloqueio de escrita; rollback executado.
- testes transacionais de auditoria: eventos de release regulatório e RQE confirmados; rollback executado.
- lint e advisors locais após a migration regulatória: aprovados, sem alertas.
- tentativas iniciais do dry-run remoto pararam antes de acessar o banco com `401 Unauthorized`; a CLI foi autenticada novamente e a validação concluída depois.
- `npm run lint` e `npm run typecheck`: aprovados após a migration e documentação regulatória.
- `npm run build`: aprovado fora do sandbox; a tentativa interna compilou, mas o processo auxiliar foi bloqueado por `spawn EPERM`.
- nova autenticação da CLI Supabase: concluída pelo fluxo oficial de verificação.
- dry-run remoto regulatório: aprovado; listou somente `20260822210413_official_specialty_catalog_and_rqe.sql`, sem seeds ou outras alterações.
- push remoto regulatório: aprovado; a quarta migration foi aplicada com sucesso.
- histórico remoto: aprovado; as quatro versões locais e remotas estão alinhadas.
- lint remoto após a migration regulatória: aprovado, sem erros de schema.
- advisors remotos: somente o aviso já conhecido `auth_leaked_password_protection`.
- migration `20260822214905_import_official_specialty_catalogs.sql`: aplicada local e remotamente; confirmou Medicina 55+62, Fisioterapia 16+7 e 182 pré-requisitos.
- migration `20260822220138_normalize_profession_catalog_links.sql`: aplicada local e remotamente após ERD de reconciliação aprovado; releases transferidos para `Médico` e `Fisioterapeuta`, duplicatas inativadas e nome do CREFITO corrigido.
- histórico remoto: seis migrations locais e remotas alinhadas; lint remoto sem erros após a normalização.
- tela `/dashboard/cadastros/estruturas`: verificada autenticada com catálogo controlado, badges oficiais e releases CFM/COFFITO, sem alerta de carregamento.
- catálogo oficial reorganizado em resumo e gaveta lateral; busca por `Gerontologia` e ocultação da lista longa verificadas no navegador.
- ficha profissional regulatória: lint, TypeScript e build aprovados; fluxo dinâmico de RQE aguarda dados reais para verificação visual.
