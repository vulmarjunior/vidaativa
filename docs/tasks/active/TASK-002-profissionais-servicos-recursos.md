# TASK-002 — Profissionais, serviços, salas e recursos

Status: Pronta para desenvolvimento — próxima tarefa da sessão  
Prioridade: P0  
Módulo: Profissionais, serviços e recursos  
Dependências: fundação de perfis e auditoria  
Criada em: 2026-08-21

## Objetivo

Implementar os cadastros estruturantes necessários para agenda, prontuários e repasses.

## Escopo

- profissionais e situação ativa/inativa;
- dados de conselho profissional e UF;
- especialidades;
- serviços oferecidos, duração e situação;
- salas e recursos/equipamentos;
- relações entre profissionais, especialidades e serviços;
- autorização, RLS e auditoria;
- interfaces administrativas com busca e estados de interface.

## Fora do escopo

- agenda e disponibilidade;
- cálculo ou pagamento de repasses;
- assinatura digital;
- execução do atendimento clínico;
- regras específicas de cobrança dos convênios.

## Questões de descoberta

- quais profissões e conselhos existem atualmente;
- se um profissional pode possuir mais de um conselho/especialidade;
- serviços reais, durações e necessidade de preparação/intervalo;
- salas e equipamentos compartilháveis;
- quais dados financeiros podem ser vistos por direção, financeiro e profissional.

Na ausência de resposta, modele de forma normalizada e configurável, sem inventar regras financeiras.

## Critérios de aceite

- [ ] modelo de dados documentado;
- [ ] migrations incrementais criadas, sem alterar a migration inicial;
- [ ] integridade, índices e RLS implementados;
- [ ] matriz de autorização documentada e testada;
- [ ] eventos relevantes auditados;
- [ ] CRUD administrativo funcional e responsivo;
- [ ] exclusão física impedida quando houver risco histórico;
- [ ] estados de carregamento, vazio, erro e permissão tratados;
- [ ] lint, TypeScript e build aprovados;
- [ ] fluxo verificado no navegador;
- [ ] documentação e registros atualizados.

## Progresso

- [ ] confirmar modelo conceitual com o PRD;
- [ ] criar migration;
- [ ] criar consultas e ações de servidor;
- [ ] implementar profissionais e especialidades;
- [ ] implementar serviços;
- [ ] implementar salas e recursos;
- [ ] testar autorização e auditoria;
- [ ] verificar interface;

## Arquivos previstos

- `supabase/migrations/`
- `src/app/(dashboard)/dashboard/`
- `src/lib/`
- `docs/modules/professionals-and-services.md`

## Dependência externa

O Supabase remoto está conectado e apto a receber migrations. Respostas da descoberta operacional ainda serão necessárias antes de consolidar regras específicas de vínculos, serviços, recursos e remuneração.

## Onde continuar

Ler as seções 4, 5, 7 e 20 do PRD, inspecionar as migrations já aplicadas, propor o esquema relacional e criar uma nova migration incremental. Não modificar migrations existentes.

## Validações

Ainda não executadas para esta tarefa.
