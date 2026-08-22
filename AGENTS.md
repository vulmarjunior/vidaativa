<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Contrato de desenvolvimento — Clínica Vida Ativa

Este arquivo é a primeira leitura obrigatória de qualquer agente ou pessoa que trabalhe no repositório. O sistema é personalizado, single-tenant e destinado exclusivamente à Clínica Vida Ativa.

## Ordem obrigatória de retomada

Antes de alterar código:

1. Leia este arquivo integralmente.
2. Leia `docs/PROJECT_STATUS.md`.
3. Leia `docs/ROADMAP.md`.
4. Abra a tarefa indicada como ativa em `docs/tasks/active/`.
5. Leia a documentação do módulo afetado em `docs/modules/`.
6. Consulte o PRD nas seções relacionadas.
7. Verifique `git status` e preserve alterações existentes.

Se os registros divergirem do código, investigue antes de avançar. O código e as migrations demonstram o estado técnico; o PRD determina o produto; `PROJECT_STATUS.md` registra o ponto de retomada.

## Fontes de verdade

1. Requisitos: `PRD_FINAL_SISTEMA_GESTAO_CLINICA.md`.
2. Regras de trabalho: `AGENTS.md`.
3. Estado atual: `docs/PROJECT_STATUS.md`.
4. Sequenciamento: `docs/ROADMAP.md`.
5. Escopo em execução: arquivo em `docs/tasks/active/`.
6. Decisões permanentes: `docs/decisions/`.

O DOCX do PRD é apenas uma versão de apresentação. Mudanças de requisitos devem ser feitas primeiro no Markdown.

## Regras de execução

- Trabalhe em uma tarefa ativa por vez, salvo correção urgente documentada.
- Não trate páginas provisórias ou placeholders como funcionalidades concluídas.
- Não amplie o escopo da tarefa sem registrar a decisão.
- Nunca altere migrations já aplicadas; crie uma nova migration incremental.
- Aplique RLS a toda tabela exposta e teste autorização por perfil.
- Registre ações sensíveis em auditoria.
- Nunca use dados reais de pacientes em desenvolvimento, testes, imagens ou commits.
- Nunca versione `.env.local`, chaves, certificados, tokens ou segredos.
- Preserve o modelo single-tenant; não introduza `tenant_id` sem ADR e mudança aprovada no PRD.
- Prefira componentes existentes em `src/components/ui` e os tokens do tema.
- Mantenha azul como cor da medicina e verde-água como cor da fisioterapia, usando tokens, não cores espalhadas no código.
- Antes de usar APIs do Next.js, consulte a documentação local da versão instalada, conforme o bloco automático acima.

## Organização do repositório

- `src/`: aplicação.
- `supabase/migrations/`: alterações incrementais e imutáveis do banco.
- `public/`: recursos públicos permanentes.
- `docs/modules/`: regras e estado de cada módulo.
- `docs/tasks/active/`: trabalho atual.
- `docs/tasks/backlog/`: tarefas especificadas e ainda não iniciadas.
- `docs/tasks/completed/`: tarefas encerradas.
- `docs/decisions/`: ADRs de decisões arquiteturais relevantes.
- `docs/sessions/`: registro cronológico curto das sessões.
- `.artifacts/`: arquivos temporários de testes e capturas; nunca versionar.

Não deixe capturas, rascunhos, exports, scripts temporários ou arquivos de diagnóstico na raiz.

## Fluxo de uma tarefa

1. Confirmar objetivo, escopo, exclusões e critérios de aceite.
2. Registrar dependências e riscos.
3. Implementar banco, segurança, domínio e interface na ordem adequada.
4. Atualizar o progresso no arquivo da tarefa durante pontos relevantes.
5. Executar as validações proporcionais ao risco.
6. Atualizar documentação do módulo, status, changelog e sessão.
7. Mover a tarefa para `completed/` somente quando todos os critérios estiverem atendidos.

## Definição de pronto

Uma funcionalidade só está concluída quando, conforme aplicável:

- regras de negócio e perfis autorizados estão documentados;
- migration, integridade, índices e RLS estão implementados;
- auditoria está implementada para ações relevantes;
- interface trata carregamento, vazio, sucesso, erro e falta de permissão;
- acessibilidade e responsividade foram verificadas;
- lint e TypeScript passam;
- build de produção passa;
- fluxo principal foi testado no navegador;
- documentação do módulo e registros do projeto foram atualizados.

Comandos mínimos:

```bash
npm run lint
npm run typecheck
npm run build
```

## Encerramento obrigatório da sessão

Antes de parar, atualize:

1. a seção `Progresso` e o campo `Onde continuar` da tarefa ativa;
2. `docs/PROJECT_STATUS.md`;
3. o documento do módulo, se o estado funcional mudou;
4. `CHANGELOG.md`, quando houver mudança entregue;
5. um registro curto em `docs/sessions/`.

Registre comandos de validação realmente executados e seus resultados. Nunca marque como validado algo que não foi testado.
