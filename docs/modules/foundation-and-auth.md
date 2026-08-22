# Módulo: Fundação e autenticação

Estado: Validado — autenticação administrativa funcional no Supabase remoto  
PRD: seções 4, 5, 18 e 19

## Responsabilidade

Fornecer aplicação Next.js, autenticação, sessão SSR, perfis, autorização inicial, navegação e auditoria básica.

## Implementado

- cliente Supabase para navegador e servidor;
- atualização de sessão no proxy;
- login por e-mail e senha;
- perfis e papéis iniciais no banco;
- políticas RLS iniciais;
- tabela base de auditoria;
- dashboard e navegação responsivos;
- modo de prévia quando o Supabase não está configurado.

## Validado no Supabase remoto

- aplicação das migrations;
- lint do esquema sem erros;
- consultor de segurança sem alertas estruturais de banco;
- índice de `clinic_settings.updated_by` adicionado após recomendação de desempenho.
- primeiro administrador criado, confirmado e registrado na auditoria.
- login administrativo confirmado como funcional pelo usuário.

## Não validado

- login real;
- expiração e renovação de sessão;
- matriz completa de autorização;
- fluxos de recuperação de senha e encerramento de sessão;
- auditoria e RLS em banco remoto.

## Pendências

- testar cada papel previsto no PRD;
- implementar gestão de usuários e convites;
- definir MFA para perfis privilegiados.
- habilitar proteção contra senhas vazadas no Auth.
