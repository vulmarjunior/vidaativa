# Segurança, privacidade e LGPD

Este documento é um checklist técnico inicial e não substitui análise jurídica ou definição formal do programa de privacidade da clínica.

## Princípios obrigatórios

- acesso individual; nunca compartilhar contas;
- menor privilégio por função;
- RLS em todas as tabelas expostas;
- dados clínicos acessíveis somente a perfis autorizados;
- auditoria de leitura e alteração quando exigida pelo risco;
- segredos somente em variáveis protegidas;
- nenhum dado real em testes ou ambientes não autorizados;
- anexos clínicos em armazenamento privado com acesso temporário;
- documentos assinados não devem ser sobrescritos;
- retenção, correção e descarte devem seguir política aprovada pela clínica.

## Antes de cada módulo sensível

- identificar finalidade e base de tratamento;
- definir perfis autorizados;
- classificar dados pessoais e sensíveis;
- definir eventos auditados;
- validar exportação, impressão e download;
- verificar risco de exposição em logs, URLs, notificações e arquivos.

## Antes da produção

- validar RLS com matriz de perfis;
- configurar MFA para perfis privilegiados quando disponível;
- definir backup, restauração e continuidade;
- definir resposta a incidentes;
- revisar logs e observabilidade para evitar conteúdo clínico;
- registrar operador, controlador e fornecedores envolvidos;
- formalizar termos, consentimentos e avisos aplicáveis.
