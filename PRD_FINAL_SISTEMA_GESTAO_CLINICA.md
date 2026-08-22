# PRD — Sistema Integrado de Gestão Clínica

> Fonte de verdade funcional para projeto, implementação, testes e homologação.

| Campo | Definição |
|---|---|
| Versão | 1.1 |
| Data | 22 de agosto de 2026 |
| Status | Pronto para descoberta técnica e execução |
| Produto | Sistema de gestão e site institucional para clínica multidisciplinar |
| Arquitetura | Single-tenant, exclusiva para a clínica contratante |
| Stack obrigatória | Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase e Vercel |

## 1. Instruções para o agente de código

Este documento define **o que** deve ser construído. Antes de implementar cada módulo, o agente deve:

1. Confirmar as pendências de descoberta relacionadas ao módulo.
2. Propor o modelo de dados e as políticas de acesso.
3. Dividir o módulo em entregas pequenas e testáveis.
4. Registrar decisões arquiteturais relevantes.
5. Implementar autorização no banco e no servidor, não apenas na interface.
6. Criar migrations, tipos, validações e testes proporcionais ao risco.
7. Atualizar este PRD quando uma decisão aprovada alterar um requisito.
8. Executar verificação de tipos, lint, testes e build antes de concluir uma entrega.

### 1.1 Convenções

- `P0`: necessário para operação do MVP.
- `P1`: necessário na primeira evolução ou versão final contratada.
- `P2`: evolução opcional.
- `RF`: requisito funcional.
- `RN`: regra de negócio.
- `RNF`: requisito não funcional.
- `CA`: critério de aceite.

### 1.2 Hierarquia de autoridade

Em caso de conflito:

1. obrigação legal ou regulatória vigente;
2. decisão formal aprovada pela clínica;
3. este PRD;
4. documentação técnica complementar;
5. comportamento atual do código.

Não alterar regra clínica, fiscal, TISS ou financeira por suposição.

---

## 2. Visão do produto

Construir uma plataforma web exclusiva para centralizar a operação clínica, administrativa, financeira e de convênios de uma clínica que oferece:

- atendimento médico;
- fisioterapia;
- pilates;
- fortalecimento;
- musculação orientada para idosos;
- estética não invasiva, incluindo massagens e drenagem linfática;
- outros serviços futuros configuráveis compatíveis com as capacidades do sistema.

O sistema é o produto principal. O site institucional é acessório e compartilha o mesmo ecossistema técnico, mantendo separação entre área pública e autenticada.

### 2.1 Objetivos

- Centralizar cadastros, agenda, atendimento, convênios e financeiro.
- Eliminar controles paralelos e duplicidades.
- Manter prontuários seguros, longitudinais e auditáveis.
- Controlar atendimento particular e por convênio.
- Reduzir conflitos de agenda, glosas evitáveis e erros de repasse.
- Emitir recibos e preparar emissão futura de NFS-e.
- Entregar solução funcional de prescrição digital no MVP.

### 2.2 Restrições arquiteturais

- O sistema é personalíssimo e exclusivo para a clínica.
- A arquitetura é single-tenant.
- Não criar `tenant_id`.
- Não criar cadastro de empresas clientes, planos SaaS ou marca branca.
- Havendo filiais, usar `unit_id` apenas para unidades da mesma empresa.
- Não introduzir complexidade para futura comercialização.
- Não usar ORM por padrão.
- Não adicionar Redis, microserviços, GraphQL, Docker ou infraestrutura estrutural sem necessidade comprovada e decisão registrada.

---

## 3. Escopo por fase

### 3.1 MVP — P0

- Autenticação, MFA, usuários, perfis e permissões.
- Pacientes, responsáveis e pagadores.
- Profissionais, especialidades, serviços, salas e recursos.
- Catálogo extensível de categorias, serviços e capacidades, sem depender de alteração de código para novos serviços compatíveis.
- Agenda individual, coletiva e recorrente.
- Sala de espera e estados do atendimento.
- Prontuário médico e fisioterapêutico.
- Anamnese, avaliação, plano e evolução.
- Pilates, fortalecimento, musculação orientada para idosos, estética não invasiva, pacotes, mensalidades e reposições.
- Fichas de treino, planos terapêuticos e registro do executado por sessão.
- Convênios, planos, carteirinhas e contratos.
- Procedimentos e códigos TUSS.
- Autorizações, guias, lotes, protocolos e glosas.
- Exportação XML TISS quando utilizada pela operação atual.
- Contas a receber e a pagar.
- Caixa, formas de pagamento e taxas.
- Repasses aos profissionais.
- Orçamentos e recibos.
- Prescrição digital com VIDaaS, integrada ou por contingência homologada.
- WhatsApp assistido e e-mail operacional.
- Auditoria e exportações autorizadas.
- Site institucional.

### 3.2 Versão final contratada — P1

- Integração completa com VIDaaS/IntegraICP, se comercialmente viável.
- API oficial do WhatsApp e automações aprovadas.
- Integrações TISS prioritárias com operadoras.
- Emissão integrada de NFS-e.
- Conciliação avançada de convênios e pagamentos.
- Body chart e comparação visual de avaliações, se não incluídos no MVP.

### 3.3 Futuro opcional — P2

- Teleconsulta.
- Portal do paciente.
- Aplicativo móvel nativo.
- Pagamento online.
- Conciliação bancária automática.
- Estoque.
- Integrações laboratoriais e com equipamentos.

### 3.4 Fora do escopo

- SaaS ou multitenancy.
- CRM comercial, funil de vendas e prospecção.
- Marketing para captar outras clínicas.
- Contabilidade fiscal completa.
- Folha de pagamento.
- IA clínica.

---

## 4. Perfis e autorização

| Perfil | Responsabilidade | Conteúdo clínico |
|---|---|---|
| Administrador técnico | Configuração, usuários e parâmetros | Não por padrão |
| Direção | Indicadores e gestão | Somente mediante regra justificada |
| Recepção | Cadastro, agenda, chegada, cobrança autorizada e recibo | Não |
| Financeiro/faturamento | Caixa, despesas, convênios, lotes, glosas e repasses | Não |
| Médico | Consulta, prontuário, prescrições e documentos | Pacientes autorizados |
| Fisioterapeuta | Avaliação, plano terapêutico e evolução | Pacientes autorizados |
| Pilates/fortalecimento | Agenda, presença, restrições necessárias e evolução permitida | Limitado à necessidade |
| Exercício/musculação | Avaliação permitida, ficha de treino, execução e evolução funcional | Pacientes autorizados e limitado à habilitação |
| Estética | Avaliação específica, procedimento, contraindicações e evolução permitida | Pacientes autorizados e limitado à habilitação |
| Suporte | Diagnóstico técnico temporário e auditado | Não por padrão |

### Regras

- **RN-AUTH-001:** cada usuário deve possuir conta individual.
- **RN-AUTH-002:** contas compartilhadas são proibidas.
- **RN-AUTH-003:** administrador técnico não recebe acesso clínico implícito.
- **RN-AUTH-004:** recepção e financeiro não podem consultar anamnese, diagnóstico ou evolução.
- **RN-AUTH-005:** toda autorização deve ser garantida por RLS e validação no servidor.
- **RN-AUTH-006:** exceções de acesso devem ser temporárias, justificadas e auditadas.

---

## 5. Autenticação e usuários

### Requisitos

- **RF-AUTH-001 [P0]:** autenticar por e-mail e senha.
- **RF-AUTH-002 [P0]:** recuperar senha por fluxo seguro.
- **RF-AUTH-003 [P0]:** ativar e inativar usuários sem excluir histórico.
- **RF-AUTH-004 [P0]:** habilitar MFA para profissionais e perfis sensíveis.
- **RF-AUTH-005 [P0]:** vincular usuário a perfil, profissional e unidade, quando houver.
- **RF-AUTH-006 [P0]:** revogar sessões.
- **RF-AUTH-007 [P0]:** auditar login, falhas relevantes e mudanças de permissão.

### Critérios de aceite

- **CA-AUTH-001:** usuário inativo não consegue autenticar.
- **CA-AUTH-002:** o frontend não consegue contornar uma restrição aplicada no banco.
- **CA-AUTH-003:** mudança de perfil registra responsável, data e valores anterior e posterior.

---

## 6. Pacientes, responsáveis e pagadores

### Requisitos

- **RF-PAC-001 [P0]:** cadastrar nome, nome social, CPF, documento, nascimento, contatos e endereço.
- **RF-PAC-002 [P0]:** cadastrar responsável legal, responsável financeiro, pagador e contato de emergência.
- **RF-PAC-003 [P0]:** relacionar paciente e responsável com grau de parentesco e vigência.
- **RF-PAC-004 [P0]:** pesquisar por nome, CPF, telefone e identificador.
- **RF-PAC-005 [P0]:** alertar possíveis duplicidades.
- **RF-PAC-006 [P0]:** inativar cadastro preservando histórico.
- **RF-PAC-007 [P0]:** vincular convênio, plano, número da carteira, validade e titular.

### Regras

- **RN-PAC-001:** paciente, responsável, pagador e tomador fiscal podem ser pessoas diferentes.
- **RN-PAC-002:** CPF não é obrigatório em todos os cenários, mas duplicidades devem ser tratadas.
- **RN-PAC-003:** dados clínicos não aparecem na listagem administrativa geral.
- **RN-PAC-004:** exclusão física de paciente é proibida na operação normal.

---

## 7. Profissionais, serviços, salas e recursos

### Requisitos

- **RF-CAD-001 [P0]:** cadastrar profissional, profissão, especialidade, conselho, UF e qualificações.
- **RF-CAD-002 [P0]:** cadastrar serviços, categoria, duração, preço, capacidade e modalidade.
- **RF-CAD-003 [P0]:** indicar profissionais habilitados por serviço.
- **RF-CAD-004 [P0]:** cadastrar salas e recursos exclusivos.
- **RF-CAD-005 [P0]:** configurar disponibilidade e bloqueios.
- **RF-CAD-006 [P0]:** manter vigência de preço e regra de repasse.
- **RF-CAD-007 [P0]:** criar, alterar, categorizar e inativar serviços sem alteração de código.
- **RF-CAD-008 [P0]:** configurar por serviço modalidade individual ou coletiva, duração, capacidade, intervalo, profissionais, salas, recursos, avaliação prévia, formulários, termos, cobrança e repasse.
- **RF-CAD-009 [P0]:** associar formulários e termos versionados ao serviço, indicando obrigatoriedade e momento de preenchimento.
- **RF-CAD-010 [P0]:** indicar se o serviço admite particular, convênio, ambos ou se não é faturável isoladamente.
- **RF-CAD-011 [P0]:** configurar capacidades assistenciais do serviço, como avaliação, plano, evolução, ficha de treino, registro de sessão e reavaliação.
- **RF-CAD-012 [P0]:** cadastrar catálogo reutilizável de atividades, exercícios, técnicas e procedimentos, com categoria, parâmetros aplicáveis, recursos e situação.

### Regras

- **RN-CAD-001:** alteração de preço não modifica cobranças anteriores.
- **RN-CAD-002:** serviço inativo permanece no histórico.
- **RN-CAD-003:** duração pode variar por serviço e profissional.
- **RN-CAD-004:** alteração de serviço, categoria, formulário, termo ou capacidade não modifica retroativamente atendimentos e documentos anteriores.
- **RN-CAD-005:** categorias de serviço são dados administrativos configuráveis e não enums rígidos no código ou banco.
- **RN-CAD-006:** novos serviços utilizam capacidades existentes; comportamento assistencial inédito exige análise, atualização do PRD e implementação de capacidade reutilizável.
- **RN-CAD-007:** habilitação profissional por serviço deve considerar profissão, qualificação e conselho quando aplicável, sem presunção automática do sistema.
- **RN-CAD-008:** atividades e parâmetros devem ser extensíveis sem criar tabelas isoladas por modalidade.

### Critérios de aceite

- **CA-CAD-001:** administrador cadastra categoria e serviço, associa profissionais, preço, duração, recursos, formulários e cobrança, disponibilizando-o sem nova implantação de código.
- **CA-CAD-002:** inativar categoria, serviço ou atividade preserva integralmente o histórico.
- **CA-CAD-003:** uma atividade pode ser reutilizada em planos de modalidades diferentes com parâmetros próprios.

---

## 8. Agenda e jornada do atendimento

### Requisitos

- **RF-AGE-001 [P0]:** oferecer visões diária, semanal e mensal.
- **RF-AGE-002 [P0]:** filtrar por profissional, sala, unidade e modalidade.
- **RF-AGE-003 [P0]:** criar agendamento avulso e recorrente.
- **RF-AGE-004 [P0]:** permitir encaixe, bloqueio e lista de espera.
- **RF-AGE-005 [P0]:** controlar capacidade de atendimentos coletivos.
- **RF-AGE-006 [P0]:** reservar profissional, sala e recurso.
- **RF-AGE-007 [P0]:** confirmar, registrar chegada, iniciar e concluir atendimento.
- **RF-AGE-008 [P0]:** cancelar, reagendar e registrar falta com motivo.
- **RF-AGE-009 [P0]:** manter fila de sala de espera e horário de chegada.
- **RF-AGE-010 [P0]:** gerar ou atualizar cobrança conforme configuração.

### Estados

`reservado → aguardando confirmação → confirmado → chegou → em atendimento → concluído`

Estados alternativos: `cancelado`, `faltou`, `reagendado`.

### Regras

- **RN-AGE-001:** bloquear conflito de profissional.
- **RN-AGE-002:** bloquear conflito de sala ou recurso exclusivo.
- **RN-AGE-003:** respeitar capacidade da turma.
- **RN-AGE-004:** reagendamento preserva referência ao agendamento anterior.
- **RN-AGE-005:** cancelamento registra motivo, usuário e data.
- **RN-AGE-006:** dados clínicos não aparecem na agenda administrativa.

### Critérios de aceite

- **CA-AGE-001:** uma recorrência pode ser alterada individualmente ou em série.
- **CA-AGE-002:** dois pacientes não ocupam o mesmo recurso exclusivo no mesmo horário.
- **CA-AGE-003:** concluir atendimento aplica a regra financeira configurada sem duplicar cobrança.

---

## 9. Prontuário clínico

### Requisitos comuns

- **RF-CLI-001 [P0]:** organizar prontuário longitudinal por paciente e atendimento.
- **RF-CLI-002 [P0]:** manter estados `rascunho`, `finalizado` e `retificado`.
- **RF-CLI-003 [P0]:** registrar autor, conselho, data e hora.
- **RF-CLI-004 [P0]:** permitir adendo ou retificação sem sobrescrever a versão anterior.
- **RF-CLI-005 [P0]:** anexar PDFs e imagens em armazenamento privado.
- **RF-CLI-006 [P0]:** registrar acesso, finalização, retificação e exportação.
- **RF-CLI-007 [P0]:** imprimir ou exportar somente mediante permissão.

### Regras

- **RN-CLI-001:** registro finalizado não pode ser editado diretamente.
- **RN-CLI-002:** exclusão física de registro clínico é proibida na operação normal.
- **RN-CLI-003:** uma retificação exige justificativa e preserva o conteúdo anterior.
- **RN-CLI-004:** acesso depende da necessidade profissional, não somente do cargo.

### 9.1 Prontuário médico

- **RF-MED-001 [P0]:** queixa principal e história da doença atual.
- **RF-MED-002 [P0]:** antecedentes, alergias, medicamentos em uso e hábitos.
- **RF-MED-003 [P0]:** exame físico e sinais vitais.
- **RF-MED-004 [P0]:** hipóteses, diagnóstico, CID quando utilizado e conduta.
- **RF-MED-005 [P0]:** retorno, evolução, encaminhamento e solicitação de exames.
- **RF-MED-006 [P0]:** receitas, laudos, relatórios, declarações e atestados conforme regras vigentes.

### 9.2 Prontuário fisioterapêutico

- **RF-FIS-001 [P0]:** avaliação postural e funcional.
- **RF-FIS-002 [P0]:** dor, amplitude, força e testes específicos.
- **RF-FIS-003 [P0]:** diagnóstico cinético-funcional, objetivos e plano terapêutico.
- **RF-FIS-004 [P0]:** técnicas aplicadas, resposta, evolução, reavaliação e alta.
- **RF-FIS-005 [P0]:** registrar medidas seriadas por data, lado, unidade e instrumento.
- **RF-FIS-006 [P1]:** mapa corporal/body chart com comparação entre avaliações.

### 9.3 Pilates e fortalecimento

- **RF-PIL-001 [P0]:** registrar objetivos, restrições e plano individual.
- **RF-PIL-002 [P0]:** controlar presença em sessões individuais e coletivas.
- **RF-PIL-003 [P0]:** registrar programa, progressão, carga, séries e repetições quando aplicável.
- **RF-PIL-004 [P0]:** registrar intercorrências, dor, limitação e reavaliação.

### 9.4 Musculação orientada e exercícios

- **RF-EXE-001 [P0]:** registrar avaliação funcional, objetivos, restrições e necessidade de liberação ou reavaliação conforme definição do responsável técnico.
- **RF-EXE-002 [P0]:** montar ficha individual com exercícios, equipamento, séries, repetições, carga, duração, intervalo, frequência, orientação e adaptação.
- **RF-EXE-003 [P0]:** registrar por sessão atividades previstas e efetivamente realizadas, incluindo carga, execução parcial, suspensão e justificativa.
- **RF-EXE-004 [P0]:** registrar tolerância, dor, dificuldade, intercorrência e necessidade de revisão.
- **RF-EXE-005 [P0]:** controlar sessões individuais, coletivas, recorrentes e capacidade por profissional, sala e recurso.

### 9.5 Estética não invasiva

- **RF-EST-001 [P0]:** suportar avaliação e anamnese específicas por serviço estético.
- **RF-EST-002 [P0]:** registrar objetivo, região, contraindicações, técnica, duração, produtos ou equipamentos, resposta, orientações e intercorrências.
- **RF-EST-003 [P0]:** exigir avaliação, termo ou consentimento quando configurado para o serviço.
- **RF-EST-004 [P0]:** separar autorização de imagem clínica de autorização de divulgação.
- **RF-EST-005 [P0]:** permitir venda avulsa, pacote ou mensalidade conforme configuração.

### 9.6 Planos assistenciais, fichas e tratamentos

- **RF-PLA-001 [P0]:** criar planos assistenciais reutilizáveis para fisioterapia, musculação, fortalecimento, pilates e modalidades futuras.
- **RF-PLA-002 [P0]:** organizar o plano em seções e itens ordenados, vinculando atividades do catálogo.
- **RF-PLA-003 [P0]:** configurar por item séries, repetições, carga, unidade, duração, distância, velocidade, intensidade, intervalo, frequência, amplitude, lado, região, equipamento, orientação e critério de progressão conforme aplicável.
- **RF-PLA-004 [P0]:** criar modelos reutilizáveis, copiáveis e personalizáveis por paciente sem substituir avaliação individual.
- **RF-PLA-005 [P0]:** versionar planos e fichas, preservando autoria, vigência, conteúdo anterior e motivo da revisão.
- **RF-PLA-006 [P0]:** relacionar cada sessão à versão do plano utilizada e diferenciar prescrito de efetivamente executado.
- **RF-PLA-007 [P0]:** permitir parâmetros adicionais validados para atividades futuras sem abandonar relações estruturais de paciente, plano, profissional, atividade e versão.

### Regras de planos

- **RN-PLA-001:** sessão executada sempre referencia a versão do plano vigente utilizada no atendimento.
- **RN-PLA-002:** alterar um plano nunca modifica retroativamente sessões anteriores.
- **RN-PLA-003:** modelos não substituem avaliação, prescrição ou decisão individual do profissional habilitado.
- **RN-PLA-004:** atividade prevista e atividade realizada são registros distintos e rastreáveis.
- **RN-PLA-005:** recepção e financeiro não acessam conteúdo de planos, fichas ou evolução.
- **RN-PLA-006:** parâmetros frequentes e pesquisáveis usam estrutura relacional; parâmetros adicionais usam dados validados e versionados, não JSON arbitrário sem esquema.

### Critérios de aceite clínicos

- **CA-CLI-001:** o conteúdo anterior permanece disponível após retificação.
- **CA-CLI-002:** recepção e financeiro não conseguem consultar o conteúdo.
- **CA-CLI-003:** arquivo clínico só é servido por URL temporária autorizada.
- **CA-CLI-004:** toda versão finalizada identifica inequivocamente o profissional.

---

## 10. Formulários, termos e consentimentos

- **RF-FOR-001 [P0]:** disponibilizar modelos próprios por especialidade e modalidade.
- **RF-FOR-002 [P0]:** suportar texto, seleção, escala, data, número, medida e sim/não.
- **RF-FOR-003 [P0]:** versionar formulários e preservar a versão respondida.
- **RF-TER-001 [P0]:** registrar termos de privacidade, responsabilidade e políticas operacionais.
- **RF-TER-002 [P0]:** manter autorização de uso de imagem separada e opcional.
- **RF-TER-003 [P0]:** registrar versão, data, hora e evidência do aceite.
- **RF-TER-004 [P0]:** permitir revogação quando juridicamente aplicável.
- **RF-TER-005 [P0]:** associar termos, consentimentos, avaliações e liberações aos serviços e planos que os exigem.
- **RF-TER-006 [P0]:** manter finalidade de fotografia clínica separada da finalidade de divulgação pública.

O MVP não requer um construtor genérico ilimitado de formulários. Os modelos serão personalizados para a clínica.

---

## 11. Prescrição e assinatura digital

### Premissa confirmada

A médica possui certificado digital ICP-Brasil A3 em nuvem VIDaaS, emitido pela AR-CFM/CREMERO. O sistema nunca armazenará senha, biometria, QR Code de recuperação ou chave privada.

### Requisitos

- **RF-ASS-001 [P0]:** elaborar prescrição dentro do atendimento.
- **RF-ASS-002 [P0]:** gerar PDF final para assinatura.
- **RF-ASS-003 [P0]:** permitir fluxo com VIDaaS integrado ou contingência homologada.
- **RF-ASS-004 [P0]:** armazenar o PDF assinado como documento imutável.
- **RF-ASS-005 [P0]:** vincular documento a paciente, atendimento, profissional e tipo.
- **RF-ASS-006 [P0]:** registrar emissão, assinatura, envio, substituição e cancelamento.
- **RF-ASS-007 [P0]:** permitir validação da assinatura e cadeia ICP-Brasil.
- **RF-ASS-008 [P0]:** alertar vencimento do certificado.
- **RF-ASS-009 [P1]:** integrar diretamente com IntegraICP/VIDaaS, se viável.

### Fluxo preferencial

1. Médico elabora e revisa o documento.
2. Sistema gera PDF.
3. Médico inicia assinatura.
4. VIDaaS solicita autorização da titular.
5. Documento assinado retorna ao sistema.
6. Sistema valida, armazena e registra auditoria.
7. Documento é disponibilizado ao paciente por canal seguro.

### Contingência do MVP

1. Sistema gera PDF.
2. Médica assina pelo aplicativo VIDaaS, VIDaaS Connect ou plataforma do CFM.
3. PDF assinado é devolvido ao sistema.
4. Sistema armazena, relaciona e audita o documento.

### Prova de conceito obrigatória

- **POC-ASS-001:** assinar PDF fictício no VIDaaS.
- **POC-ASS-002:** validar no ITI.
- **POC-ASS-003:** testar VIDaaS Connect nos computadores utilizados.
- **POC-ASS-004:** solicitar canal, documentação, homologação, custo, limites e SLA da IntegraICP.
- **POC-ASS-005:** confirmar uso do certificado gratuito do CFM na API.
- **POC-ASS-006:** testar PAdES, autorização, retorno e integridade.

### Critérios de aceite

- **CA-ASS-001:** somente a titular consegue autorizar a assinatura.
- **CA-ASS-002:** alteração posterior invalida ou quebra a integridade do documento.
- **CA-ASS-003:** o sistema não recebe nem registra senha ou biometria.
- **CA-ASS-004:** indisponibilidade do fornecedor não impede o registro do atendimento.
- **CA-ASS-005:** tipos não admitidos digitalmente são bloqueados ou direcionados ao fluxo apropriado.

---

## 12. Convênios e TISS

### 12.1 Cadastros e contratos

- **RF-CON-001 [P0]:** cadastrar operadora, registro ANS e contatos.
- **RF-CON-002 [P0]:** cadastrar planos e vigência.
- **RF-CON-003 [P0]:** cadastrar contrato, tabela negociada e calendário de faturamento.
- **RF-CON-004 [P0]:** mapear serviço interno para procedimento e código TUSS.
- **RF-CON-005 [P0]:** preservar valores e regras por vigência.
- **RF-CON-006 [P0]:** cadastrar carteirinha, titular, validade e dados do beneficiário.

### 12.2 Autorizações

- **RF-AUT-001 [P0]:** registrar solicitação, senha, validade, quantidade e status.
- **RF-AUT-002 [P0]:** controlar saldo autorizado por paciente e procedimento.
- **RF-AUT-003 [P0]:** alertar validade e esgotamento.
- **RF-AUT-004 [P0]:** anexar documentos e protocolos.
- **RF-AUT-005 [P0]:** vincular atendimento, autorização e guia.

### 12.3 Guias, lotes e XML

- **RF-TISS-001 [P0]:** gerar as guias utilizadas pela clínica.
- **RF-TISS-002 [P0]:** preencher dados a partir do cadastro, agenda, atendimento e autorização.
- **RF-TISS-003 [P0]:** validar campos obrigatórios.
- **RF-TISS-004 [P0]:** agrupar guias em lotes.
- **RF-TISS-005 [P0]:** fechar lote e registrar protocolo.
- **RF-TISS-006 [P0]:** exportar XML na versão aplicável à operação.
- **RF-TISS-007 [P0]:** validar XML com schema XSD correspondente.
- **RF-TISS-008 [P0]:** preservar versão TISS e TUSS usada.
- **RF-TISS-009 [P0]:** importar ou atualizar terminologias sem alterar históricos.
- **RF-TISS-010 [P1]:** transmitir diretamente para operadoras prioritárias.

### 12.4 Glosas, recursos e recebimentos

- **RF-GLO-001 [P0]:** registrar glosa total ou parcial.
- **RF-GLO-002 [P0]:** registrar motivo, valor e observação.
- **RF-GLO-003 [P0]:** controlar prazo de contestação.
- **RF-GLO-004 [P0]:** registrar recurso, documentos, protocolo e resultado.
- **RF-GLO-005 [P0]:** conciliar apresentado, glosado, liberado e recebido.
- **RF-GLO-006 [P0]:** refletir recebimento e glosa no repasse.

### Regras

- **RN-TISS-001:** códigos, schemas e versões não podem ficar hardcoded em regras de negócio.
- **RN-TISS-002:** atualização de terminologia não altera lote anterior.
- **RN-TISS-003:** lote fechado não pode ser editado silenciosamente.
- **RN-TISS-004:** saldo autorizado não pode ser consumido em duplicidade.
- **RN-TISS-005:** deve ser possível rastrear atendimento da autorização ao recebimento.

---

## 13. Financeiro

### 13.1 Contas a receber

- **RF-REC-001 [P0]:** gerar cobrança por atendimento, pacote, mensalidade ou convênio.
- **RF-REC-002 [P0]:** admitir pagador diferente do paciente.
- **RF-REC-003 [P0]:** controlar parcelas, vencimentos, descontos e acréscimos.
- **RF-REC-004 [P0]:** registrar pagamento total ou parcial.
- **RF-REC-005 [P0]:** registrar dinheiro, PIX, cartão, transferência e operadora.
- **RF-REC-006 [P0]:** controlar crédito do paciente.
- **RF-REC-007 [P0]:** estornar sem apagar o pagamento original.

Estados: `prevista`, `pendente`, `parcial`, `paga`, `vencida`, `cancelada`, `estornada`.

### 13.2 Pacotes, mensalidades e reposições

- **RF-PCT-001 [P0]:** cadastrar quantidade, frequência, vigência e saldo.
- **RF-PCT-002 [P0]:** renovar, reajustar, congelar e cancelar.
- **RF-PCT-003 [P0]:** controlar frequência semanal e manutenção da vaga.
- **RF-PCT-004 [P0]:** aplicar política de falta e reposição.
- **RF-PCT-005 [P0]:** relacionar sessão original, crédito e reposição.
- **RF-PCT-006 [P0]:** permitir pacotes com serviços iguais ou combinados e consumir saldo pelo serviço efetivamente realizado.

### 13.3 Contas a pagar e caixa

- **RF-PAG-001 [P0]:** cadastrar fornecedores, categorias e centros de custo.
- **RF-PAG-002 [P0]:** lançar despesas avulsas e recorrentes.
- **RF-PAG-003 [P0]:** registrar competência, vencimento e pagamento.
- **RF-CXA-001 [P0]:** cadastrar contas bancárias e caixas.
- **RF-CXA-002 [P0]:** abrir, movimentar, conferir e fechar caixa.
- **RF-CXA-003 [P0]:** registrar divergência e responsável.
- **RF-CXA-004 [P0]:** registrar taxas de cartão, valor bruto, líquido, adquirente e previsão.
- **RF-CXA-005 [P0]:** transferir valores entre contas.

### 13.4 Repasses

- **RF-REP-001 [P0]:** configurar valor fixo, percentual, hora ou sessão.
- **RF-REP-002 [P0]:** definir base sobre serviço ou valor recebido.
- **RF-REP-003 [P0]:** configurar por profissional e serviço com vigência.
- **RF-REP-004 [P0]:** considerar particulares, convênios, glosas e estornos.
- **RF-REP-005 [P0]:** calcular, conferir, aprovar, pagar e ajustar.
- **RF-REP-006 [P0]:** gerar demonstrativo detalhado.

### Regras financeiras

- **RN-FIN-001:** pagamento confirmado não pode ser apagado.
- **RN-FIN-002:** correção ocorre por estorno ou compensação.
- **RN-FIN-003:** desconto registra responsável e motivo.
- **RN-FIN-004:** alterar regra de repasse não recalcula período fechado.
- **RN-FIN-005:** toda parcela diferencia competência, vencimento e data efetiva.

### 13.5 Orçamentos e recibos

- **RF-ORC-001 [P0]:** criar orçamento com serviços, quantidade, desconto e validade.
- **RF-ORC-002 [P0]:** registrar aprovação ou recusa.
- **RF-ORC-003 [P0]:** converter orçamento em pacote ou cobrança.
- **RF-RCB-001 [P0]:** gerar recibo numerado vinculado ao pagamento.
- **RF-RCB-002 [P0]:** emitir segunda via com o mesmo número.
- **RF-RCB-003 [P0]:** preservar cancelamento e estorno.
- **RF-RCB-004 [P0]:** disponibilizar código ou QR Code de validação, se adotado.

---

## 14. Comunicação operacional

### MVP

- **RF-COM-001 [P0]:** cadastrar WhatsApp e preferência de contato.
- **RF-COM-002 [P0]:** preparar mensagens de confirmação, lembrete, cancelamento e pagamento.
- **RF-COM-003 [P0]:** abrir conversa manual com mensagem preparada.
- **RF-COM-004 [P0]:** enviar comunicações operacionais por e-mail.
- **RF-COM-005 [P0]:** registrar envio sem armazenar conteúdo sensível desnecessário.

### Versão final

- **RF-COM-006 [P1]:** integrar API oficial do WhatsApp.
- **RF-COM-007 [P1]:** usar templates aprovados.
- **RF-COM-008 [P1]:** registrar entrega e resposta.
- **RF-COM-009 [P1]:** permitir confirmação e solicitação de cancelamento.

### Regras

- **RN-COM-001:** mensagens comuns não devem conter diagnóstico, anamnese ou descrição clínica.
- **RN-COM-002:** não utilizar automação que simule WhatsApp Web.

---

## 15. Site institucional

- **RF-SITE-001 [P0]:** página inicial.
- **RF-SITE-002 [P0]:** clínica, serviços, profissionais e estrutura.
- **RF-SITE-003 [P0]:** contato, localização e canais oficiais.
- **RF-SITE-004 [P0]:** política de privacidade e termos aplicáveis.
- **RF-SITE-005 [P0]:** formulário público protegido contra spam.
- **RF-SITE-006 [P0]:** solicitação de agendamento sujeita à confirmação.
- **RF-SITE-007 [P0]:** SEO técnico básico, responsividade e acessibilidade.
- **RF-SITE-008 [P0]:** publicar categorias e serviços liberados pela clínica sem exigir alteração de código para cada novo serviço.

O site não terá CRM, funil comercial ou recursos para vender o sistema a terceiros.

---

## 16. NFS-e — versão final

### Preparação no MVP

- **RF-NFSE-001 [P0]:** armazenar tomador, CPF/CNPJ, endereço, serviço, código fiscal e valor.
- **RF-NFSE-002 [P0]:** armazenar descontos, retenções, município e pagamento relacionado.

### Integração final

- **RF-NFSE-003 [P1]:** emitir NFS-e pelo provedor aplicável.
- **RF-NFSE-004 [P1]:** consultar situação.
- **RF-NFSE-005 [P1]:** armazenar XML, protocolo e representação PDF.
- **RF-NFSE-006 [P1]:** cancelar ou substituir conforme regras vigentes.
- **RF-NFSE-007 [P1]:** tratar rejeição e impedir duplicidade.
- **RF-NFSE-008 [P1]:** relacionar nota, atendimento, pagamento e estorno.

A integração depende do município, regime tributário, API e validação do contador.

---

## 17. Relatórios

- **RF-REL-001 [P0]:** atendimentos, ocupação, faltas e cancelamentos.
- **RF-REL-002 [P0]:** pacientes novos, turmas, salas e lista de espera.
- **RF-REL-003 [P0]:** autorizações, saldos, guias, lotes e protocolos.
- **RF-REL-004 [P0]:** glosas, recursos e recebimentos por operadora.
- **RF-REL-005 [P0]:** contas a receber, inadimplência, despesas e fluxo de caixa.
- **RF-REL-006 [P0]:** pacotes, mensalidades e formas de pagamento.
- **RF-REL-007 [P0]:** produção, base e repasse por profissional.
- **RF-REL-008 [P0]:** auditoria de acessos, alterações e exportações.
- **RF-REL-009 [P0]:** produção, sessões e utilização por categoria e serviço configurável.
- **RF-REL-010 [P0]:** acompanhamento de pacotes e planos assistenciais sem expor conteúdo clínico a perfis administrativos.

Relatórios devem respeitar as mesmas permissões dos dados de origem. Indicadores gerenciais devem usar dados agregados quando possível.

---

## 18. Requisitos não funcionais

### Segurança e privacidade

- **RNF-SEC-001:** HTTPS obrigatório.
- **RNF-SEC-002:** RLS em todas as tabelas protegidas.
- **RNF-SEC-003:** validação server-side com Zod.
- **RNF-SEC-004:** menor privilégio.
- **RNF-SEC-005:** arquivos privados com URLs temporárias.
- **RNF-SEC-006:** segredos somente no servidor.
- **RNF-SEC-007:** `service_role` nunca no navegador.
- **RNF-SEC-008:** ambientes separados.
- **RNF-SEC-009:** dados de teste fictícios ou anonimizados.
- **RNF-SEC-010:** processo de incidente e política de retenção.

### Auditoria e integridade

- **RNF-AUD-001:** registrar usuário, ação, entidade, data/hora, origem e justificativa.
- **RNF-AUD-002:** logs de auditoria não podem ser editados por usuários comuns.
- **RNF-AUD-003:** preservar versões de documentos, preços, contratos, regras e terminologias.
- **RNF-AUD-004:** exportações sensíveis exigem permissão e registro.

### Desempenho

- **RNF-PERF-001:** páginas operacionais em até 3 segundos em condições normais.
- **RNF-PERF-002:** pesquisa de paciente em até 2 segundos.
- **RNF-PERF-003:** PDF comum em até 10 segundos.
- **RNF-PERF-004:** listas extensas devem usar paginação.

### Continuidade

- **RNF-BCP-001:** backups automáticos.
- **RNF-BCP-002:** restauração testada periodicamente.
- **RNF-BCP-003:** monitoramento e registro de erros.
- **RNF-BCP-004:** procedimento para indisponibilidade.
- **RNF-BCP-005:** possibilidade de imprimir ou exportar a agenda do dia.

### Usabilidade e acessibilidade

- **RNF-UX-001:** interface em português do Brasil.
- **RNF-UX-002:** responsiva para computador, tablet e celular.
- **RNF-UX-003:** estados de loading, vazio, sucesso e erro.
- **RNF-UX-004:** confirmação de ações destrutivas ou sensíveis.
- **RNF-UX-005:** contraste e navegação por teclado nos fluxos principais.
- **RNF-UX-006:** suportar versões atuais de Chrome, Edge, Safari e Firefox.

---

## 19. Stack e diretrizes de implementação

### Stack obrigatória

- Next.js com App Router.
- TypeScript em modo estrito.
- React Server Components por padrão.
- Client Components apenas para interação necessária.
- Tailwind CSS e shadcn/ui.
- Supabase PostgreSQL, Auth e Storage.
- `@supabase/supabase-js` e `@supabase/ssr`.
- React Hook Form e Zod.
- date-fns.
- Resend.
- `@react-pdf/renderer`.
- Recharts somente quando útil.
- GitHub e Vercel.

### Diretrizes

- Acesso a dados e segredos no servidor.
- Server Actions ou Route Handlers conforme o fluxo.
- Migrations versionadas.
- Tipos do banco gerados e atualizados.
- `.env.example` sem valores secretos.
- Não commitar credenciais.
- Componentes pequenos e responsabilidades claras.
- Sem abstrações prematuras.
- Integrações externas encapsuladas por adaptadores.
- TISS/TUSS importáveis e versionados.

### Estrutura inicial sugerida

```text
app/
├── (public)/
├── (auth)/
├── (dashboard)/
│   ├── agenda/
│   ├── pacientes/
│   ├── prontuarios/
│   ├── convenios/
│   ├── financeiro/
│   ├── repasses/
│   └── configuracoes/
└── api/

components/
├── ui/
├── forms/
├── clinical/
├── scheduling/
├── financial/
└── shared/

lib/
├── supabase/
├── auth/
├── validations/
├── permissions/
├── audit/
├── pdf/
├── email/
├── tiss/
├── signature/
└── integrations/

actions/
types/
docs/
```

---

## 20. Modelo conceitual de dados

### Identidade

`users`, `profiles`, `roles`, `permissions`, `professional_profiles`, `professional_registrations`, `units`

### Pacientes e operação

`patients`, `patient_relationships`, `service_categories`, `services`, `service_capabilities`, `service_professionals`, `service_prices`, `service_forms`, `service_terms`, `rooms`, `resources`, `service_resources`, `availability_rules`, `appointments`, `appointment_recurrences`, `attendance_events`

### Clínico

`encounters`, `clinical_records`, `anamneses`, `assessments`, `evolutions`, `activity_categories`, `activities`, `activity_parameter_definitions`, `activity_resources`, `care_plans`, `care_plan_versions`, `care_plan_sections`, `care_plan_items`, `care_plan_templates`, `care_plan_template_versions`, `care_plan_template_items`, `care_plan_sessions`, `care_plan_session_items`, `prescriptions`, `clinical_documents`, `digital_signatures`, `attachments`, `terms`, `consents`

Categorias, serviços, atividades e tipos de plano são dados configuráveis. Nomes comerciais ou modalidades atuais não devem gerar tabelas exclusivas. Parâmetros adicionais de atividade podem usar estrutura semiestruturada validada e versionada, mantendo relacionais as entidades, vínculos, autoria e datas relevantes.

### Convênios

`insurers`, `insurance_plans`, `insurance_contracts`, `contract_price_tables`, `tuss_terms`, `patient_insurances`, `authorizations`, `tiss_guides`, `tiss_batches`, `tiss_protocols`, `denials`, `denial_appeals`

### Financeiro

`charges`, `installments`, `payments`, `refunds`, `patient_credits`, `packages`, `subscriptions`, `expenses`, `financial_accounts`, `cash_sessions`, `cash_movements`, `quotes`, `receipts`

### Repasses

`payout_rules`, `payout_calculations`, `payout_adjustments`, `payout_payments`

### Governança

`audit_events`, `notifications`, `exports`, `security_incidents`

### Fiscal futuro

`service_invoices`, `invoice_events`, `invoice_artifacts`

Os nomes são conceituais e podem ser refinados. O agente deve apresentar o ERD antes das migrations principais.

---

## 21. Ordem de execução

### Etapa 0 — descoberta

- Levantar usuários, profissionais, serviços, salas e unidades.
- Levantar categorias atuais, capacidades comuns, atividades, exercícios, técnicas e procedimentos sem tratá-los como lista fechada.
- Reunir fichas de treino, planos terapêuticos, avaliações funcionais, anamneses estéticas, termos e modelos atualmente utilizados.
- Reunir formulários e documentos atuais.
- Documentar política de faltas, cancelamentos e reposições.
- Levantar convênios, contratos, TUSS, guias, portais e glosas.
- Documentar regras financeiras e de repasse com exemplos reais.
- Inventariar dados legados.
- Executar POC do VIDaaS.
- Aprovar protótipos dos fluxos críticos.

### Etapa 1 — fundação

- Inicializar projeto e ambientes.
- Configurar Supabase SSR.
- Criar autenticação, perfis, MFA e RLS.
- Criar auditoria.
- Criar cadastros estruturais.
- Publicar base do site.

### Etapa 2 — agenda e clínica

- Pacientes e relacionamentos.
- Agenda, recorrência, salas, recursos e fila.
- Atendimentos e prontuários.
- Catálogo de atividades, planos assistenciais, fichas de treino e registro do executado por sessão.
- Formulários, avaliações, evoluções e anexos.
- Termos e consentimentos.
- Pacotes, mensalidades e reposições.

### Etapa 3 — convênios/TISS

- Operadoras, planos e contratos.
- TUSS versionada.
- Autorizações e saldo.
- Guias, lotes e protocolos.
- XML e validação.
- Glosas, recursos e conciliação.

### Etapa 4 — financeiro

- Contas a receber e a pagar.
- Caixa, contas, taxas e estornos.
- Orçamentos e recibos.
- Repasses.
- Relatórios.

### Etapa 5 — prescrição digital

- Documentos médicos.
- Integração ou contingência VIDaaS.
- Validação, envio e auditoria.

### Etapa 6 — comunicação e implantação

- E-mail e WhatsApp assistido.
- Migração aprovada.
- Treinamento.
- Homologação.
- Entrada controlada em produção.

### Etapa 7 — versão final

- WhatsApp oficial.
- Integrações prioritárias com operadoras.
- NFS-e.
- Melhorias aprovadas.

---

## 22. Critérios globais de aceite do MVP

- [ ] Usuários acessam somente módulos autorizados.
- [ ] Recepção e financeiro não acessam conteúdo clínico.
- [ ] Agenda individual e coletiva impede conflitos indevidos.
- [ ] Prontuários podem ser finalizados e retificados sem perda de versão.
- [ ] Arquivos clínicos permanecem privados.
- [ ] Convênios atuais podem ser cadastrados e operados.
- [ ] Autorizações, guias, lotes e protocolos são rastreáveis.
- [ ] XML TISS aplicável é validado.
- [ ] Glosas e recursos podem ser registrados.
- [ ] Financeiro diferencia paciente e operadora.
- [ ] Pagamentos, despesas, caixa, mensalidades e pacotes funcionam.
- [ ] Repasses são explicáveis e reproduzíveis.
- [ ] Recibos são numerados e rastreáveis.
- [ ] Prescrição digital é utilizável com VIDaaS.
- [ ] Auditoria registra operações críticas.
- [ ] Site institucional está publicado.
- [ ] Backups e restauração estão documentados e testados.
- [ ] Testes, lint, TypeScript e build passam sem erros.
- [ ] Usuários-chave aprovam os cenários de homologação.

### Definição de pronto por requisito

- [ ] Implementado conforme o requisito.
- [ ] Validado no servidor.
- [ ] RLS e permissões testadas.
- [ ] Estados de interface completos.
- [ ] Auditoria implementada quando aplicável.
- [ ] Erros tratados sem exposição de dados.
- [ ] Testes proporcionais ao risco aprovados.
- [ ] Documentação atualizada.
- [ ] Homologação registrada.

---

## 23. Descoberta obrigatória pendente

O agente não deve inventar os itens abaixo.

### Clínica

- Razão social, nome fantasia e unidades.
- Profissionais, especialidades e conselhos.
- Serviços, durações, preços, salas e recursos.
- Modalidades individuais/coletivas, capacidades configuráveis e critérios para particular ou convênio.
- Profissionais responsáveis por musculação para idosos e estética, respectivas habilitações e responsabilidades técnicas.
- Equipamentos e insumos usados em musculação, fortalecimento, fisioterapia, pilates e estética.
- Fichas de treino, planos de tratamento, parâmetros, modelos e periodicidade de reavaliação.
- Regras para avaliação prévia, contraindicações, liberação, fotografias clínicas e consentimentos.
- Capacidade de turmas.
- Formulários e modelos clínicos.

### Convênios

- Operadoras e registros ANS.
- Planos e contratos.
- Procedimentos e códigos TUSS utilizados.
- Guias e autorizações exigidas.
- Portais, webservices e credenciais.
- Calendário de faturamento.
- Histórico de glosas e prazos de recurso.

### Financeiro

- Formas de pagamento e contas.
- Taxas de cartão.
- Regras de caixa.
- Pacotes, mensalidades e reposições.
- Regras de repasse com exemplos.
- Município, regime fiscal e fluxo de NFS-e.

### Implantação

- Sistemas, planilhas e fichas existentes.
- Volume e período a migrar.
- Estratégia de corte e operação paralela.
- Responsáveis por homologação.

---

## 24. Riscos

| Risco | Nível | Controle |
|---|---|---|
| Acesso indevido ao prontuário | Crítico | RLS, MFA, menor privilégio e auditoria |
| Alteração silenciosa | Crítico | Finalização imutável, adendo e versões |
| Perda de dados | Crítico | Backup e restauração testada |
| Integração VIDaaS indisponível | Alto | POC precoce e contingência externa |
| Mudança do TISS/TUSS | Alto | Importação, versão e validação por schema |
| Glosas por cadastro incorreto | Alto | Autorizações e conferência de lote |
| Repasse incorreto | Alto | Vigência, simulação e homologação |
| Migração inconsistente | Alto | Limpeza, teste e conferência |
| Resistência operacional | Médio/alto | Protótipos, treinamento e implantação gradual |
| Indisponibilidade da internet | Médio/alto | Agenda do dia e procedimento de contingência |

---

## 25. Referências

- [ANS — Padrão TISS](https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss)
- [CFM — Certificado Digital](https://certificadodigital.cfm.org.br/)
- [CFM — Prescrição Eletrônica](https://prescricaoeletronica.cfm.org.br/)
- [Valid — IntegraICP](https://validcertificadora.com.br/pages/psc-integracao-via-api)
- [ITI — Validador de assinaturas](https://validar.iti.gov.br/)
- [ANPD — Perguntas frequentes](https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes/perguntas-frequentes)
- [Portal Nacional da NFS-e — Documentação técnica](https://www.gov.br/nfse/pt-br/nfs-e-via/documentacao-tecnica/documentacao-tecnica)
- [CFM — Resolução nº 1.821/2007](https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2007/1821)

As referências regulatórias devem ser verificadas novamente antes de cada integração e antes da entrada em produção.

---

## 26. Registro de decisões consolidadas

| ID | Decisão |
|---|---|
| DEC-001 | O sistema será single-tenant e exclusivo para a clínica. |
| DEC-002 | O site é acessório; o sistema de gestão é o produto principal. |
| DEC-003 | Convênios e TISS integram o MVP. |
| DEC-004 | Teleconsulta permanece futura e opcional. |
| DEC-005 | Não haverá CRM comercial. |
| DEC-006 | WhatsApp operacional é prioritário; automação oficial entra na evolução. |
| DEC-007 | O MVP terá solução funcional de prescrição com VIDaaS. |
| DEC-008 | NFS-e não integra o MVP, mas integra a versão final. |
| DEC-009 | A chave privada e os fatores de autenticação da médica nunca serão armazenados. |
| DEC-010 | Registros clínicos finalizados e documentos assinados são imutáveis. |
| DEC-011 | Categorias e serviços são configuráveis; a lista atual não limita serviços futuros da clínica. |
| DEC-012 | Novos serviços compatíveis usam capacidades existentes sem alteração de código; comportamento inédito exige capacidade reutilizável e revisão do PRD. |
| DEC-013 | Fisioterapia, musculação, fortalecimento e modalidades futuras compartilham um núcleo versionado de planos, fichas, atividades e execução por sessão. |
| DEC-014 | Estética não invasiva, incluindo massagens e drenagem linfática, integra o escopo operacional do MVP. |

---

## 27. Aprovação

| Papel | Responsável | Status |
|---|---|---|
| Direção da clínica | A definir | Pendente |
| Responsável clínico médico | A definir | Pendente |
| Responsável pela fisioterapia | A definir | Pendente |
| Financeiro/faturamento | A definir | Pendente |
| Responsável técnico | A definir | Pendente |
| Jurídico/LGPD | A definir | Revisão antes da produção |
