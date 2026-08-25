# Changelog

As mudanças relevantes deste projeto são registradas aqui. O formato segue versões de produto; tarefas internas permanecem documentadas em `docs/tasks/`.

## [Não lançado]

### Adicionado

- Padrão de continuidade para agentes, acompanhamento de tarefas, módulos, decisões e sessões.
- Conexão com o projeto Supabase `Vida_Ativa` e aplicação das migrations iniciais.
- Índice para a referência de auditoria `clinic_settings.updated_by`.
- Bootstrap do primeiro administrador com registro de auditoria.
- Autenticação administrativa validada no ambiente Supabase remoto.
- PRD ampliado para estética não invasiva e musculação orientada para idosos.
- Catálogo extensível de serviços, capacidades e atividades definido.
- Núcleo conceitual versionado para planos terapêuticos, fichas de treino e execução por sessão.
- ERD e migration incremental para profissionais, serviços, atividades, salas, recursos, formulários e termos.
- Interface administrativa inicial para profissionais, categorias de serviço, serviços, salas e recursos.
- Proteção efetiva das rotas internas pelo `proxy.ts` do Next.js 16, com redirecionamento de usuários sem sessão.
- Modelo regulatório versionado para catálogos oficiais de especialidades, pré-requisitos e registros de RQE, separado das qualificações acadêmicas.
- Catálogos oficiais CFM/CME e COFFITO importados com fontes, vigências, códigos aplicáveis e pré-requisitos.
- Ficha profissional com catálogo filtrado por profissão e fluxo administrativo de registro e conferência do RQE.
- Consulta de especialidades em gaveta lateral com busca e filtros, substituindo a tabela extensa na página estrutural.
- Múltiplos papéis por conta individual, com RLS baseada na união das permissões, revogação histórica e auditoria de atribuições.
- Administração de usuários com convites individuais, múltiplos papéis, vínculo profissional, inativação de acesso e definição de senha pelo convidado.
- Navegação e página inicial personalizadas por espaços de trabalho, combinando os módulos permitidos para todos os papéis ativos da conta.
- Explicações de escopo junto a cada papel na administração de usuários.
- Estados acessíveis de carregamento, recuperação de erro inesperado e cadastro não encontrado nas rotas de cadastros estruturantes.
- Administração compacta de usuários com busca, filtros, edição lateral, papéis explicados sob demanda e situações distintas para convite pendente, ativo e inativo.
- Cancelamento protegido e auditado de convites nunca confirmados, preservando inativação como única opção para contas confirmadas.

## [0.1.0] — 2026-08-21

### Adicionado

- Fundação Next.js e Supabase do sistema single-tenant.
- Site institucional inicial com identidade médica e fisioterápica.
- Login preparado para Supabase Auth.
- Painel administrativo e navegação inicial.
- Cadastro de dados institucionais da clínica.
- Estrutura inicial de perfis, RLS e auditoria.
