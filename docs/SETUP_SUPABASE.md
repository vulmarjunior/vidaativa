# Configuração do Supabase

Estado em 2026-08-21: projeto `Vida_Ativa` vinculado e migrations iniciais aplicadas. O primeiro administrador ainda precisa ser criado.

## 1. Criar e conectar o projeto

1. Crie um projeto Supabase exclusivo para a Clínica Vida Ativa.
2. Copie `.env.example` para `.env.local` e preencha a URL e a chave publicável.
3. Vincule o repositório com `npx supabase link`.
4. Aplique as migrações com `npx supabase db push`.

As políticas de segurança por linha já estão definidas na migração inicial. A chave `service_role` não deve ser colocada no navegador nem em variáveis `NEXT_PUBLIC_*`.

## 2. Criar o primeiro administrador

O primeiro usuário deve ser criado no painel de Authentication do Supabase. Depois, execute no SQL Editor, substituindo o UUID e os dados abaixo:

```sql
insert into public.profiles (user_id, full_name, role, active)
values ('UUID_DO_USUARIO', 'Nome do administrador', 'admin', true);
```

Primeiro administrador criado em 2026-08-21. Não registre e-mail, UUID ou senha neste documento.

Depois desse cadastro inicial, o administrador poderá acessar as configurações e salvar os dados institucionais da clínica.

## 3. Dados institucionais

A tabela `clinic_settings` mantém um único registro para esta instalação single-tenant. Nome fantasia, razão social, CNPJ, contatos, endereço e cores são consumidos pelo site e pela área interna.

O envio de logotipo ficará disponível quando o bucket privado de arquivos institucionais for configurado. Até lá, o símbolo provisório permanece no tema.
