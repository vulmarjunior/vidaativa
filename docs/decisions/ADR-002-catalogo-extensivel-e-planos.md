# ADR-002 — Catálogo extensível de serviços e núcleo comum de planos

Estado: Aceito
Data: 2026-08-22

## Contexto

A clínica oferece medicina, fisioterapia, pilates, fortalecimento, musculação orientada para idosos e estética não invasiva, incluindo massagens e drenagem linfática. Outros serviços poderão ser adicionados e não podem ser previstos integralmente no PRD.

Fisioterapia, musculação, fortalecimento e modalidades futuras precisam montar fichas ou planos e registrar o executado, sem criar uma estrutura isolada para cada modalidade.

## Decisão

- Categorias, serviços, capacidades e atividades serão dados configuráveis, não enums rígidos.
- Um novo serviço compatível com capacidades existentes poderá ser cadastrado sem alteração de código.
- Comportamento assistencial inédito exigirá análise e implementação como capacidade reutilizável.
- Planos terapêuticos e fichas de treino compartilharão um núcleo comum e versionado.
- Atividade prescrita e atividade realizada serão registros distintos.
- Sessões históricas apontarão para a versão do plano utilizada.
- Parâmetros frequentes e pesquisáveis permanecerão relacionais; extensões usarão estrutura validada e versionada.

## Consequências

- evita tabelas exclusivas por modalidade;
- permite ampliar o catálogo da clínica;
- exige desenho cuidadoso de capacidades e parâmetros;
- reduz retrabalho futuro em fichas e tratamentos;
- não transforma o produto em construtor clínico ilimitado;
- mantém conteúdo assistencial protegido das áreas administrativas.
