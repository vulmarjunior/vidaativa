# Rotina de sessão — VIDA ON / OFF

## `vida on`

1. Seguir a ordem de retomada do `AGENTS.md`: `AGENTS.md`,
   `docs/PROJECT_STATUS.md`, `docs/ROADMAP.md`, tarefa ativa em
   `docs/tasks/active/`, módulo afetado e PRD.
2. Conferir raiz, branch `master`, upstream e o commit local `df2a99a`
   (correção de login e recuperação de acesso). Preservar esse commit; não
   publicá-lo sem revisão.
3. Sincronizar somente com upstream definido, árvore limpa e fast-forward
   possível. Como há commit local à frente, não fazer pull, push, reset ou
   rebase por este gatilho.
4. Consultar AI Memory somente quando habilitado; neste projeto está desativado.
5. Informar Git, tarefa ativa, bloqueios e próximo passo. Não implementar
   apenas pelo gatilho.

## `vida off`

1. Seguir o encerramento obrigatório do `AGENTS.md`: progresso e "Onde
   continuar" da tarefa ativa, `docs/PROJECT_STATUS.md`, documento do módulo,
   `CHANGELOG.md` e registro em `docs/sessions/`.
2. Não commitar ou publicar automaticamente; preservar o commit local não
   publicado.
3. Informar concluído, pendente, validações, arquivos alterados, estado do Git e
   próxima ação.
