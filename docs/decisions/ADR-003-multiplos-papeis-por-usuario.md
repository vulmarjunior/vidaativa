# ADR-003 — Múltiplos papéis por usuário

Estado: Aceito
Data: 2026-08-24

## Contexto

Uma mesma pessoa pode acumular responsabilidades na clínica, como direção e atuação assistencial. Criar contas diferentes ou compartilhar credenciais fragmentaria a auditoria e contrariaria a exigência de conta individual.

O modelo inicial armazenava um único `profiles.role`, o que impedia representar esse acúmulo sem elevar permissões de forma artificial.

## Decisão

- Uma conta individual pode possuir vários papéis ativos em `profile_roles`.
- A autorização efetiva é a união das permissões concedidas por seus papéis ativos.
- O perfil da conta precisa estar ativo para qualquer papel produzir acesso.
- Atribuições são inativadas, não excluídas, preservando histórico.
- Somente administrador pode atribuir, revogar ou reativar papéis.
- Atribuição, revogação e reativação geram eventos em `audit_events`.
- O vínculo opcional entre conta e profissional continua em `profiles.professional_id` e não concede papel automaticamente.
- A coluna `profiles.role` permanece temporariamente apenas para compatibilidade de implantação e não participa das decisões de autorização.

## Consequências

- uma pessoa mantém uma única identidade e uma única trilha de auditoria;
- as políticas RLS verificam pertencimento, e não um papel escalar;
- a futura administração de usuários deverá editar `profile_roles` e exibir todos os papéis ativos;
- testes de autorização precisam cobrir papéis isolados e combinações;
- a coluna legada poderá ser removida por migration futura após a implantação da administração de usuários.
