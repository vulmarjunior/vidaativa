# Documentação dos módulos

Cada módulo deve registrar responsabilidade, regras, autorização, dados, fluxos, integrações, segurança, estado real e testes.

Estados permitidos:

- `Planejado`: apenas PRD/documentação.
- `Interface`: telas sem fluxo persistido completo.
- `Backend`: domínio e persistência implementados, ainda não validados de ponta a ponta.
- `Validado`: fluxo completo testado no ambiente indicado.
- `Produção`: implantado, monitorado e aceito.

Nunca use apenas “concluído” sem indicar o ambiente e as evidências de validação.

## Módulos

- `foundation-and-auth.md`
- `clinic-settings.md`
- `professionals-and-services.md`

Os demais documentos devem ser criados quando sua primeira tarefa for especificada, evitando documentação vazia ou fictícia.
