# Módulo: Fundação e autenticação

Estado: Validado — autenticação administrativa funcional no Supabase remoto  
PRD: seções 4, 5, 18 e 19

## Responsabilidade

Fornecer aplicação Next.js, autenticação, sessão SSR, perfis, autorização inicial, navegação e auditoria básica.

## Implementado

- cliente Supabase para navegador e servidor;
- atualização de sessão no proxy;
- login por e-mail e senha;
- perfis e múltiplos papéis por conta no banco, com atribuições históricas em `profile_roles`;
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
- múltiplos papéis reconstruídos e testados no ambiente isolado; união de permissões, revogação parcial, bloqueio de autoatribuição e auditoria aprovados.
- interface administrativa de usuários com convite por e-mail, múltiplos papéis, vínculo profissional e ativação/inativação;
- seletor de papéis apresenta descrição do escopo de cada função e informa que permissões acumuladas são combinadas e auditadas;
- navegação lateral e página inicial são personalizadas pela união dos espaços de trabalho habilitados pelos papéis ativos;
- matriz inicial de espaços e limites registrada na ADR-004; administrador técnico não recebe acesso clínico automaticamente;
- Edge Function `admin-users`, autenticada como usuário, valida o papel administrativo antes de usar o cliente privilegiado do Supabase Auth;
- fluxo público de aceite do convite e definição da senha pelo próprio usuário;
- login consulta o Supabase Auth sem bloquear previamente senhas legadas pelo tamanho e apresenta mensagens seguras por código de erro;
- recuperação de acesso por e-mail preserva a conta, o perfil, os papéis e o histórico existentes;
- retorno PKCE da recuperação usa Route Handler para trocar o código por sessão, persistir cookies e remover o código da URL antes de habilitar a nova senha;
- alteração de senha apresenta orientação específica por código seguro do Auth, sem expor credenciais;
- convite nominal em português preparado com primeiro nome e identidade da clínica; a configuração hospedada depende de SMTP compatível com personalização;
- proteção de banco impede inativar ou revogar o último administrador ativo.

## Não validado

- expiração e renovação de sessão;
- matriz completa de autorização;
- encerramento de sessão;
- auditoria e RLS em banco remoto.

## Pendências

- testar cada papel previsto no PRD;
- validar no navegador os convites e a matriz completa com contas individuais de teste;
- publicar e validar o template nominal do convite e repetir o login das contas existentes;
- definir MFA para perfis privilegiados.
- habilitar proteção contra senhas vazadas no Auth.
