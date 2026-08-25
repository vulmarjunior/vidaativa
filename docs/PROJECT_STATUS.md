# Estado atual do projeto

Atualizado em: 2026-08-24
Versão atual: 0.1.0 — fundação  
Fase do PRD: Etapa 1 — fundação e cadastros estruturantes  
Tarefa ativa: `TASK-002-profissionais-servicos-recursos.md`  
Última entrega: `TASK-001-fundacao-aplicacao.md`

## Resumo executivo

A fundação visual e técnica está implementada e compilando. O projeto Supabase `Vida_Ativa` está vinculado, as migrations iniciais foram aplicadas e o primeiro administrador está ativo. O login foi validado funcionalmente pelo usuário em 2026-08-21.

Em 2026-08-22, a descoberta ampliou o escopo para estética não invasiva e musculação orientada para idosos. O ERD estrutural da TASK-002 foi aprovado, documentado e convertido em migration incremental. A migration foi validada no ambiente Docker isolado `clinica-vida-ativa-task002-validation` e aplicada ao Supabase remoto; lint e histórico remoto passaram. A primeira interface administrativa de profissionais, categorias, serviços, salas e recursos está compilando e o dashboard passou a redirecionar usuários sem sessão ao login.

O modelo incremental de regulação profissional também foi aprovado e implementado: autoridades, releases oficiais versionados, especialidades por profissão, pré-requisitos e registros de RQE verificáveis. A quarta migration passou em reconstrução completa, RLS, integridade, auditoria, lint e advisors no ambiente isolado, foi aplicada ao Supabase remoto e teve histórico e lint remotos confirmados.

Os catálogos oficiais foram importados e normalizados no remoto: CFM/CME com 55 especialidades e 62 áreas; COFFITO com 16 especialidades e sete áreas atuais/históricas. A ficha profissional filtra por profissão, protege pré-requisitos e oferece registro pendente e conferência administrativa de RQE. As seis migrations estão alinhadas e o catálogo estrutural foi verificado no navegador.

A consulta estrutural dos 140 registros foi compactada em uma gaveta lateral pesquisável, evitando que a lista completa domine a página de habilitações.

O modelo de autorização agora aceita múltiplos papéis ativos por conta individual. A migration incremental preserva o papel existente, move a fonte de verdade para `profile_roles`, aplica a união de permissões nas políticas RLS e audita atribuição, revogação e reativação. Reconstrução completa e testes transacionais no ambiente isolado foram aprovados; a interface administrativa de usuários permanece para tarefa futura.

A migration de múltiplos papéis foi aplicada ao Supabase remoto em 2026-08-24. As sete migrations locais e remotas estão alinhadas, o lint remoto passou sem erros e os advisors mantêm apenas o alerta já conhecido de proteção contra senhas vazadas desabilitada.

A interface de administração de usuários está disponível com convites individuais, múltiplos papéis, vínculo profissional, ativação/inativação e definição de senha pelo convidado. A oitava migration foi aplicada ao remoto e a Edge Function `admin-users` está ativa com JWT obrigatório. As oito migrations estão alinhadas e o lint remoto passou sem erros.

A arquitetura de navegação foi reorganizada em espaços de trabalho orientados por capacidades. O menu e a página inicial agora combinam os módulos dos papéis ativos, enquanto páginas dinâmicas também verificam acesso no servidor. A matriz inicial e a separação entre navegação, autorização de ações e RLS estão registradas na ADR-004.

## Estado funcional

| Área | Estado | Observação |
|---|---|---|
| Site institucional | Parcialmente funcional | Conteúdo inicial; dados institucionais têm fallback local |
| Identidade da clínica | Backend remoto funcional | Configurações acessíveis pelo administrador |
| Autenticação | Funcional | Primeiro administrador criado, confirmado e com login validado |
| Dashboard | Interface funcional | Indicadores ainda são demonstrativos |
| Profissionais e recursos | Em implementação | Schema remoto ativo; ficha profissional e configuração de serviços funcionais; preenchimento real e testes adicionais pendentes |
| Pacientes | Placeholder | Sem banco e regras de domínio |
| Agenda | Placeholder | Sem fluxo operacional |
| Prontuário | Placeholder | Sem registros clínicos |
| Convênios/TISS | Placeholder | Obrigatório devido aos convênios existentes |
| Financeiro | Placeholder | Sem lançamentos ou repasses |
| Prescrição digital | Planejado | Exige PoC VIDaaS/ICP-Brasil |
| Auditoria | Fundação no banco | Sem tela funcional de consulta |

## Validação mais recente

Em 2026-08-24, a navegação modular passou em lint, TypeScript e build. No navegador autenticado como administrador, foram exibidos apenas Início, Auditoria e Administração do sistema; módulos clínicos e financeiros ficaram ocultos. O acesso direto a Prontuários sem papel médico redirecionou com aviso de falta de permissão e não houve erro no console. A validação completa com papéis não administrativos continua pendente.

Em 2026-08-23:

- `/dashboard/cadastros`, `/dashboard/cadastros/estruturas` e `/dashboard/cadastros/servicos/[id]` carregaram autenticadas como administrador;
- a mensagem transitória de indisponibilidade observada inicialmente não se repetiu; todas as consultas retornaram sem erro e nenhuma correção foi necessária;
- as três rotas passaram por checagem responsiva básica em viewport de 390 px, sem rolagem horizontal;
- `npm run lint`, `npm run typecheck` e `npm run build` foram aprovados;
- nenhum dado real, registro profissional ou alteração de banco foi criado nesta sessão;
- Docker Desktop e contas não administrativas não estavam disponíveis, mantendo pendentes a repetição local de RLS/auditoria e a validação funcional por perfil.

## Pendências e bloqueios

- Disponibilizar contas individuais de teste para recepção, financeiro, médico e fisioterapeuta.
- Validar autorização no navegador e auditoria com usuários de perfis diferentes.
- Iniciar o Docker Desktop para repetir os testes no ambiente isolado da TASK-002.
- Realizar descoberta operacional prevista na seção 23 do PRD.
- Definir armazenamento e envio do logotipo institucional.
- Habilitar proteção contra senhas vazadas no Supabase Auth, conforme disponibilidade do plano.
- Verificar a ficha dinâmica e o RQE no navegador quando houver dados reais da profissional.
- Concluir acessibilidade e estados de carregamento, vazio, erro e permissão; responsividade básica já verificada.
- Definir o escopo das interfaces de formulários e termos.
- Validar a interface de usuários autenticada no navegador e criar as contas individuais de teste da matriz de autorização.

## Próxima ação recomendada

Continuar `TASK-002`: obter contas de teste não administrativas e validar autorização/auditoria por perfil. Em paralelo, validar a ficha de especialidades e RQE quando os dados reais da profissional estiverem disponíveis; depois concluir acessibilidade, estados alternativos e formulários/termos.

## Onde continuar

Leia `docs/tasks/active/TASK-002-profissionais-servicos-recursos.md` e siga a ordem registrada em `Onde continuar`. O ambiente de validação é `clinica-vida-ativa-task002-validation` (Postgres na porta 54322); nunca usar ou alterar `sge-mordomo-db` (porta 5432). Retomar pelos testes de autorização/auditoria com contas não administrativas. Se essas contas ainda não estiverem disponíveis, concluir acessibilidade e estados alternativos sem inventar dados; a ficha regulatória continua aguardando dados reais.
