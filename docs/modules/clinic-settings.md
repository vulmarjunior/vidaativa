# Módulo: Dados institucionais

Estado: Backend — interface verificada, persistência remota pendente  
PRD: seções 2, 15 e 19

## Responsabilidade

Manter a identidade da única clínica atendida pela instalação.

## Dados atuais

- razão social e nome fantasia;
- CNPJ;
- contatos e WhatsApp;
- endereço;
- cores de medicina e fisioterapia;
- campo de URL do logotipo no modelo.

## Regras

- existe apenas um registro de configuração;
- leitura por usuários autenticados;
- alteração restrita à administração/direção;
- alterações relevantes geram auditoria;
- site, login e área interna devem consumir a configuração persistida.

## Pendências

- aplicar e testar migration remota;
- implementar upload seguro do logotipo;
- ampliar dados fiscais e regulatórios conforme descoberta;
- aplicar cores persistidas ao tema com estratégia segura.
