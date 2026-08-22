# Sessão 2026-08-22 — Revisão de serviços e planos

## Objetivo

Analisar novos serviços informados pela clínica e adaptar o produto antes da modelagem de domínio.

## Realizado

- estética não invasiva, massagens e drenagem linfática incorporadas ao escopo;
- musculação orientada para idosos explicitada como modalidade assistencial;
- serviços e categorias definidos como catálogo configurável e não fechado;
- capacidades por serviço formalizadas;
- núcleo conceitual comum para planos, fichas, atividades, versões e execução por sessão incluído no PRD;
- tarefa ativa, módulo, roadmap, status, changelog e ADR atualizados.

## Decisões

- não criar tabelas por modalidade ou nome comercial;
- permitir novos serviços sem código quando utilizarem capacidades existentes;
- diferenciar plano prescrito do executado em cada sessão;
- preservar versões e histórico de planos;
- não implementar um construtor clínico ilimitado.

## Validações

- revisão documental das seções afetadas do PRD;
- nenhuma migration ou alteração de código realizada nesta sessão.

## Pendências

- responder questões operacionais da tarefa ativa;
- produzir e revisar o ERD;
- definir fronteira entre cadastro estrutural e planos clínicos futuros.

## Próxima ação

Retomar `TASK-002-profissionais-servicos-recursos.md` pelo campo “Onde continuar” e apresentar o ERD antes da próxima migration.
