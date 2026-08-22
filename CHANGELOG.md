# Changelog

As mudanças relevantes deste projeto são registradas aqui. O formato segue versões de produto; tarefas internas permanecem documentadas em `docs/tasks/`.

## [Não lançado]

### Adicionado

- Padrão de continuidade para agentes, acompanhamento de tarefas, módulos, decisões e sessões.
- Conexão com o projeto Supabase `Vida_Ativa` e aplicação das migrations iniciais.
- Índice para a referência de auditoria `clinic_settings.updated_by`.
- Bootstrap do primeiro administrador com registro de auditoria.
- Autenticação administrativa validada no ambiente Supabase remoto.

## [0.1.0] — 2026-08-21

### Adicionado

- Fundação Next.js e Supabase do sistema single-tenant.
- Site institucional inicial com identidade médica e fisioterápica.
- Login preparado para Supabase Auth.
- Painel administrativo e navegação inicial.
- Cadastro de dados institucionais da clínica.
- Estrutura inicial de perfis, RLS e auditoria.
