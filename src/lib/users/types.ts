export const APP_ROLES = ["admin", "direction", "reception", "billing", "doctor", "physiotherapist", "movement_professional", "support"] as const;
export type AppRole = typeof APP_ROLES[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador técnico",
  direction: "Direção",
  reception: "Recepção",
  billing: "Financeiro / faturamento",
  doctor: "Médico",
  physiotherapist: "Fisioterapeuta",
  movement_professional: "Pilates / exercício / movimento",
  support: "Suporte técnico",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  admin: "Configura usuários, permissões e parâmetros. Não recebe acesso clínico automaticamente.",
  direction: "Consulta indicadores, gestão e auditoria conforme as regras da clínica.",
  reception: "Opera cadastros, agenda, chegada e cobranças autorizadas, sem conteúdo clínico.",
  billing: "Acessa caixa, despesas, convênios, faturamento, glosas e repasses, sem prontuário.",
  doctor: "Realiza consultas, prontuário médico, prescrições e documentos de pacientes autorizados.",
  physiotherapist: "Realiza avaliações, planos terapêuticos e evoluções de pacientes autorizados.",
  movement_professional: "Opera pilates, fortalecimento e exercícios no limite da habilitação profissional.",
  support: "Executa diagnóstico técnico temporário e auditado, sem acesso clínico por padrão.",
};

export type ManagedUser = {
  id: string;
  email: string;
  fullName: string;
  active: boolean;
  professionalId: string | null;
  roles: AppRole[];
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  bannedUntil: string | null;
};

export type UserAdministrationData = {
  currentUserId: string | null;
  canManage: boolean;
  users: ManagedUser[];
  professionals: { id: string; name: string; active: boolean }[];
  error: string | null;
};
