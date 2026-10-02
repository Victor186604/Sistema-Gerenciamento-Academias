export interface Empresa {
  id: number;
  nome: string;
  cnpj: string;
  plano: 'basic' | 'pro' | 'enterprise';
  ativa: boolean;
  totalAcademias?: number;
  totalAlunos?: number;
  mensalidadesAtrasadas?: number;
  receitaTotal?: number;
}

export interface Usuario {
  id: number;
  empresaId: number | null;
  empresaNome?: string;
  nome: string;
  email: string;
  papel: 'superadmin' | 'admin' | 'operador';
  academiaId: number | null;
  ativo: boolean;
}

export interface Academia {
  id: number;
  empresaId: number;
  nome: string;
  cidade: string;
  bairro: string;
  capacidade: number;
  status: string;
}

export interface Instrutor {
  id: number;
  empresaId: number;
  nome: string;
  idade: number;
  cpf: string;
  especialidade: string;
  academiaId: number | null;
}

export interface Exercicio {
  id: number;
  empresaId: number;
  nome: string;
  series: number;
  reps: number;
  grupo: string;
}

export interface Treino {
  id: number;
  empresaId: number;
  nome: string;
  instrutorId: number | null;
  exIds: number[];
}

export interface Aluno {
  id: number;
  empresaId: number;
  nome: string;
  idade: number;
  cpf: string;
  matricula: string;
  telefone: string;
  treinoId: number | null;
  academiaId: number | null;
}

export interface Mensalidade {
  id: number;
  empresaId: number;
  alunoId: number;
  valor: number;
  vencimento: string;
  status: 'Pago' | 'Pendente' | 'Atrasado';
}

export interface AppState {
  academias: Academia[];
  instrutores: Instrutor[];
  exercicios: Exercicio[];
  treinos: Treino[];
  alunos: Aluno[];
  mensalidades: Mensalidade[];
  nextId: Record<string, number>;
}

export interface SuperAdminState {
  empresas: Empresa[];
  usuarios: Usuario[];
  nextId: Record<string, number>;
}

export type PageName =
  | 'dashboard'
  | 'academias'
  | 'alunos'
  | 'instrutores'
  | 'treinos'
  | 'exercicios'
  | 'mensalidades';

export type AdminPageName = 'empresas' | 'usuarios';

export const GRUPOS = [
  'Peito','Costas','Pernas','Ombro','Bíceps','Tríceps','Abdômen','Glúteos','Funcional',
] as const;

export type Grupo = typeof GRUPOS[number];
