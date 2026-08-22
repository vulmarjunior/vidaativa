# Arquitetura — Fundação

## Decisões

- Next.js 16 com App Router e `proxy.ts`.
- Server Components por padrão.
- Supabase Auth com cookies via `@supabase/ssr`.
- PostgreSQL com RLS em todas as tabelas expostas.
- Autorização baseada em `profiles.role`, nunca em `user_metadata`.
- Sistema single-tenant sem `tenant_id`.
- Identidade da clínica armazenada em `clinic_settings`.
- Azul clínico como cor principal e verde terapêutico como secundária.
- Sem credenciais, a aplicação abre em modo de prévia.

## Segurança

- A chave `service_role` não integra o frontend ou o `.env.example`.
- O proxy usa `getClaims()` para validar sessão.
- Funções privilegiadas ficam no schema `private` e têm execução concedida explicitamente.
- Logs de auditoria são somente inserção para usuários autenticados.

## Pendências de descoberta

- Matriz definitiva de acesso clínico.
- Operadoras e fluxos TISS atuais.
- Formulários médicos e fisioterapêuticos.
- Regras de repasse, pacotes e reposições.
- Prova de conceito VIDaaS/IntegraICP.
