export type CategoriaAluno = 'SUB_7' | 'SUB_9' | 'SUB_15' | 'SUB_17' | 'ADULTO';

export type StatusAluno = 'ATIVO' | 'INATIVO';

export type TipoContratacao = 'HORISTA' | 'MENSALISTA';

export type StatusColaborador = 'ATIVO' | 'INATIVO';

export type StatusFolha = 'PENDENTE' | 'PAGO';

export type TipoLancamento = 'ENTRADA' | 'SAIDA';

export type StatusFinanceiro = 'PAGO' | 'PENDENTE' | 'PROGRAMADO';

export type FormaPagamento = 'PIX' | 'BOLETO' | 'CARTAO_CREDITO' | 'TRANSFERENCIA' | 'DINHEIRO';

export interface Aluno {
  id: number;
  nome: string;
  cpf?: string;
  dataNascimento: string;
  idade?: number;
  telefone?: string;
  responsavel: string;
  categoria: CategoriaAluno;
  turmaHorario?: string;
  status: StatusAluno;
  fotoUrl?: string;
  dataMatricula?: string;
  observacoesMedicas?: string;
  taxaFrequencia?: number;
  alertaFrequenciaBaixa?: boolean;
}

export interface FrequenciaEstatistica {
  alunoId: number;
  alunoNome: string;
  fotoUrl?: string;
  categoria: CategoriaAluno;
  totalAulas: number;
  totalPresencas: number;
  percentualPresenca: number;
  alertaFrequenciaBaixa: boolean;
}

export interface ChamadaItem {
  alunoId: number;
  alunoNome: string;
  presente: boolean;
  observacao?: string;
}

export interface Colaborador {
  id: number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  funcao: string;
  tipoContratacao: TipoContratacao;
  valorHora?: number;
  salarioFixo?: number;
  beneficios?: number;
  status: StatusColaborador;
  fotoUrl?: string;
  dataAdmissao?: string;
}

export interface FolhaAula {
  id: number;
  colaboradorId: number;
  colaboradorNome: string;
  colaboradorFuncao: string;
  colaboradorFotoUrl?: string;
  mesReferencia: string;
  horasRegistradas: number;
  valorHora: number;
  totalBruto: number;
  beneficios: number;
  descontos: number;
  liquidoPagar: number;
  status: StatusFolha;
  dataPagamento?: string;
}

export interface LancamentoFinanceiro {
  id: number;
  tipo: TipoLancamento;
  descricao: string;
  categoria: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  formaPagamento?: FormaPagamento;
  status: StatusFinanceiro;
  comprovanteUrl?: string;
  dataCriacao?: string;
}

export interface OrcamentoMes {
  mesReferencia: string;
  previsto: number;
  realizado: number;
  diferenca: number;
}

export interface CategoriaDespesa {
  categoria: string;
  total: number;
  percentual: number;
}

export interface DashboardStats {
  saldoDisponivel: number;
  saldoLivre: number;
  totalReceitasPagas: number;
  totalDespesasPagas: number;
  totalDespesasComprometidas: number;
  totalAlunosAtivos: number;
  taxaFrequenciaGlobal: number;
  despesasPorCategoria: CategoriaDespesa[];
  execucaoOrcamentaria: OrcamentoMes[];
}

export interface Material {
  id: number;
  nome: string;
  categoria: string;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  localArmazenamento?: string;
}

export interface Uniforme {
  id: number;
  tamanho: string;
  quantidadeComprada: number;
  quantidadeEntregue: number;
  saldoEstoque: number;
  descricao?: string;
}
