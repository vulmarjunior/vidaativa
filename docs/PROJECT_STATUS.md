# Estado atual do projeto

Atualizado em: 2026-08-22
Versão atual: 0.1.0 — fundação  
Fase do PRD: Etapa 1 — fundação e cadastros estruturantes  
Tarefa ativa: `TASK-002-profissionais-servicos-recursos.md`  
Última entrega: `TASK-001-fundacao-aplicacao.md`

## Resumo executivo

A fundação visual e técnica está implementada e compilando. O projeto Supabase `Vida_Ativa` está vinculado, as migrations iniciais foram aplicadas e o primeiro administrador está ativo. O login foi validado funcionalmente pelo usuário em 2026-08-21.

Em 2026-08-22, a descoberta ampliou o escopo para estética não invasiva e musculação orientada para idosos. O PRD passou a exigir catálogo extensível de serviços e núcleo versionado de planos assistenciais, fichas de treino, atividades e execução por sessão. Nenhuma migration de domínio foi criada antes dessa revisão.

## Estado funcional

| Área | Estado | Observação |
|---|---|---|
| Site institucional | Parcialmente funcional | Conteúdo inicial; dados institucionais têm fallback local |
| Identidade da clínica | Backend remoto funcional | Configurações acessíveis pelo administrador |
| Autenticação | Funcional | Primeiro administrador criado, confirmado e com login validado |
| Dashboard | Interface funcional | Indicadores ainda são demonstrativos |
| Profissionais e recursos | Não iniciado | Próxima tarefa ativa |
| Pacientes | Placeholder | Sem banco e regras de domínio |
| Agenda | Placeholder | Sem fluxo operacional |
| Prontuário | Placeholder | Sem registros clínicos |
| Convênios/TISS | Placeholder | Obrigatório devido aos convênios existentes |
| Financeiro | Placeholder | Sem lançamentos ou repasses |
| Prescrição digital | Planejado | Exige PoC VIDaaS/ICP-Brasil |
| Auditoria | Fundação no banco | Sem tela funcional de consulta |

## Validação mais recente

Em 2026-08-21:

- ESLint aprovado.
- TypeScript aprovado.
- build de produção aprovado.
- site, login, dashboard e configurações verificados no navegador.
- migrations `initial_foundation` e `add_clinic_settings_updated_by_index` aplicadas ao Supabase remoto;
- lint remoto sem erros de esquema;
- advisor remoto sem alertas estruturais do banco.
- login do primeiro administrador confirmado como funcional pelo usuário.

## Pendências e bloqueios

- Validar RLS com usuários de perfis diferentes.
- Realizar descoberta operacional prevista na seção 23 do PRD.
- Definir armazenamento e envio do logotipo institucional.
- Habilitar proteção contra senhas vazadas no Supabase Auth, conforme disponibilidade do plano.

## Próxima ação recomendada

Continuar `TASK-002`: desenhar e revisar o ERD extensível de profissionais, categorias, serviços, capacidades, atividades, salas e recursos. O desenho deve reservar vínculos para planos assistenciais futuros sem implementar prematuramente todo o módulo clínico.

## Onde continuar

Leia `docs/tasks/active/TASK-002-profissionais-servicos-recursos.md`, as seções 4, 7, 9 e 20 do PRD e `docs/decisions/ADR-002-catalogo-extensivel-e-planos.md`. Produza o ERD proposto antes de criar a próxima migration.
