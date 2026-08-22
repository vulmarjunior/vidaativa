# ADR-001 — Arquitetura single-tenant

Estado: Aceito  
Data: 2026-08-21

## Contexto

O produto é personalizado e será utilizado exclusivamente por uma única empresa/clínica. Não há objetivo de comercializá-lo como SaaS para outras clínicas.

## Decisão

O sistema será single-tenant. Configurações institucionais terão registro único e as entidades de negócio não receberão `tenant_id` preventivo.

## Consequências

- domínio e autorização ficam mais simples;
- não há isolamento lógico entre clínicas porque só existe uma clínica;
- expansão futura para múltiplas empresas exigirá nova decisão, revisão de dados, RLS e arquitetura;
- unidades internas futuras devem ser modeladas como unidades da mesma clínica, não como tenants, salvo mudança formal de produto.
