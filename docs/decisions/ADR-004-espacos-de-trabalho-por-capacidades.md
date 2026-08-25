# ADR-004 — Espaços de trabalho orientados por capacidades

Estado: Aceito
Data: 2026-08-24

## Contexto

Uma navegação única com agenda, prontuário, financeiro e administração para todas as pessoas torna o sistema confuso e sugere acessos que não deveriam existir. Ao mesmo tempo, criar aplicações independentes por profissão duplicaria pacientes, agenda e dados estruturantes.

## Decisão

- A aplicação permanece única e organiza a operação em espaços de trabalho.
- Papéis habilitam módulos e ações; módulos não são sinônimos de papéis.
- Uma conta com múltiplos papéis recebe a união dos módulos permitidos.
- O menu mostra apenas módulos habilitados, mas sua ocultação não é controle de segurança.
- Rotas e ações verificam autorização no servidor, próximas ao acesso aos dados, e o banco mantém RLS como barreira definitiva.
- Administração técnica não concede acesso clínico automaticamente.
- Agenda e pacientes são recursos transversais, mas cada área recebe somente a visão e os dados necessários ao seu trabalho.

## Matriz inicial

| Papel | Espaços de trabalho | Limites principais |
|---|---|---|
| Administrador técnico | Início, cadastros, usuários, configurações e auditoria | Sem prontuário ou operação clínica por padrão |
| Direção | Início, gestão, indicadores, financeiro, convênios e auditoria | Conteúdo clínico somente com papel assistencial adicional |
| Recepção | Início, agenda e pacientes cadastrais | Sem prontuário e sem financeiro gerencial |
| Financeiro / faturamento | Início, financeiro e convênios | Sem conteúdo clínico |
| Médico | Início, agenda, pacientes autorizados e medicina | Somente pacientes e ações autorizadas |
| Fisioterapeuta | Início, agenda, pacientes autorizados e fisioterapia | Somente pacientes e ações autorizadas |
| Movimento | Início, agenda, pacientes autorizados e movimento | Limite da habilitação e mínimo clínico necessário |
| Suporte técnico | Início | Diagnóstico excepcional, temporário e auditado; sem acesso operacional por padrão |

## Consequências

- a página inicial passa a apresentar atalhos personalizados;
- o menu lateral deixa de representar toda a clínica para representar o trabalho da pessoa autenticada;
- novas funcionalidades deverão declarar módulos, papéis, ações e escopo de dados antes da implementação;
- a matriz será refinada e testada com contas individuais antes da operação real.
