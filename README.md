# Clínica Vida Ativa

Sistema integrado de gestão clínica para atendimento médico, fisioterapia, pilates e fortalecimento.

## Documentação

- `AGENTS.md`: primeira leitura obrigatória para agentes de desenvolvimento.
- `PRD_FINAL_SISTEMA_GESTAO_CLINICA.md`: fonte de verdade funcional.
- `docs/PROJECT_STATUS.md`: situação atual e ponto exato de retomada.
- `docs/ROADMAP.md`: sequência planejada de entregas.
- `docs/tasks/active/`: tarefa em execução.
- `docs/INDEX.md`: índice completo da documentação.
- `docs/ARCHITECTURE.md`: decisões técnicas da fundação.
- `docs/SETUP_SUPABASE.md`: conexão do banco e primeiro acesso administrativo.

## Retomar o desenvolvimento

Em uma nova sessão, use:

> Leia integralmente o `AGENTS.md`, siga a ordem de retomada definida nele, verifique as alterações existentes e continue a tarefa ativa a partir do campo “Onde continuar”. Ao encerrar, execute as validações obrigatórias e atualize os registros do projeto.

## Desenvolvimento

1. Copie `.env.example` para `.env.local`.
2. Preencha a URL e a chave publicável do Supabase.
3. Aplique as migrations de `supabase/migrations`.
4. Execute `npm run dev`.

Sem as variáveis do Supabase, a aplicação abre em modo de prévia e mantém o login desabilitado.

## Verificação

```bash
npm run check
```
