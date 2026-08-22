# Sessão 2026-08-21 — Supabase remoto

## Objetivo

Conectar a aplicação ao banco criado para a Clínica Vida Ativa e aplicar a fundação.

## Realizado

- `.env.local` validado sem exposição de chaves;
- conectividade do Auth confirmada;
- CLI autenticada e repositório vinculado ao projeto `Vida_Ativa`;
- migration inicial aplicada;
- migration incremental criada e aplicada para indexar `clinic_settings.updated_by`;
- histórico local e remoto sincronizado.
- primeiro administrador criado com perfil ativo e evento de bootstrap auditado.
- login e acesso administrativo confirmados como funcionais pelo usuário.

## Validações

- endpoint Auth respondeu HTTP 200;
- `supabase migration list --linked` confirmou a migration inicial;
- `supabase db lint --linked` não encontrou erros;
- advisors de banco não mantiveram alertas estruturais.

## Pendências

- validar atualização institucional em fluxo completo caso ainda não tenha sido salva;
- testar matriz RLS;
- habilitar proteção contra senhas vazadas no Auth.

## Próxima ação

Retomar `TASK-002-profissionais-servicos-recursos.md` pelo campo “Onde continuar”.
