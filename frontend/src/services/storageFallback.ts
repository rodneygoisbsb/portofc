import { Aluno, Colaborador, FolhaAula, LancamentoFinanceiro, Material, Uniforme, OrcamentoMes, DashboardStats } from '../types';

export const INITIAL_ALUNOS_DATA: Aluno[] = [
  {
    id: 1,
    nome: "Lucas Gabriel Silveira",
    cpf: "045.221.890-11",
    dataNascimento: "2019-10-17",
    idade: 7,
    responsavel: "Mariana Silveira (Mãe)",
    telefone: "(61) 98123-4501",
    categoria: "SUB_7",
    turma: "Turma A",
    horarioTreino: "08:30 às 09:30",
    turmaHorario: "Turma A - 08:30 às 09:30",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-10",
    observacoesMedicas: "Alergia leve a picada de insetos.",
    taxaFrequencia: 92.5,
  },
  {
    id: 2,
    nome: "Enzo Miguel Ribeiro",
    cpf: "051.443.120-33",
    dataNascimento: "2020-10-21",
    idade: 6,
    responsavel: "Carlos Ribeiro (Pai)",
    telefone: "(61) 98455-1122",
    categoria: "SUB_7",
    turma: "Turma A",
    horarioTreino: "08:30 às 09:30",
    turmaHorario: "Turma A - 08:30 às 09:30",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-12",
    taxaFrequencia: 88.0,
  },
  {
    id: 3,
    nome: "Theo Henrique Souza",
    cpf: "062.889.340-55",
    dataNascimento: "2019-10-25",
    idade: 7,
    responsavel: "Patricia Souza (Mãe)",
    telefone: "(61) 99122-3344",
    categoria: "SUB_7",
    turma: "Turma B",
    horarioTreino: "10:00 às 11:00",
    turmaHorario: "Turma B - 10:00 às 11:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-03-01",
    taxaFrequencia: 68.5,
    alertaFrequenciaBaixa: true,
  },
  {
    id: 4,
    nome: "Davi Lucca Farias",
    cpf: "044.908.712-44",
    dataNascimento: "2017-10-22",
    idade: 9,
    responsavel: "Juliana Farias (Mãe)",
    telefone: "(61) 98234-9988",
    categoria: "SUB_9",
    turma: "Segunda e Quarta",
    horarioTreino: "09:00 às 10:15",
    turmaHorario: "Segunda e Quarta - 09:00 às 10:15",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-05",
    taxaFrequencia: 95.0,
  },
  {
    id: 5,
    nome: "Bernardo Ramos Costa",
    cpf: "058.112.443-90",
    dataNascimento: "2018-01-25",
    idade: 8,
    responsavel: "Fernando Costa (Pai)",
    telefone: "(61) 98711-2299",
    categoria: "SUB_9",
    turmaHorario: "Segunda e Quarta - 09:00 às 10:15",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-08",
    taxaFrequencia: 89.2,
  },
  {
    id: 6,
    nome: "Arthur Vinicius Gomes",
    cpf: "061.332.991-02",
    dataNascimento: "2017-09-30",
    idade: 9,
    responsavel: "Renata Gomes (Mãe)",
    telefone: "(61) 99654-7812",
    categoria: "SUB_9",
    turmaHorario: "Segunda e Quarta - 09:00 às 10:15",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-15",
    taxaFrequencia: 91.0,
  },
  {
    id: 7,
    nome: "Lucas Rafael Martins",
    cpf: "048.910.223-11",
    dataNascimento: "2017-11-14",
    idade: 9,
    responsavel: "Patrícia Martins (Mãe)",
    telefone: "(61) 98111-2233",
    categoria: "SUB_9",
    turma: "Terça e Quinta",
    horarioTreino: "15:30 às 16:45",
    turmaHorario: "Terça e Quinta - 15:30 às 16:45",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1546525848-3ce03ca516f6?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-18",
    taxaFrequencia: 95.5,
  },
  {
    id: 8,
    nome: "Heitor Rezende Silveira",
    cpf: "055.671.889-40",
    dataNascimento: "2018-03-08",
    idade: 8,
    responsavel: "Marcelo Silveira (Pai)",
    telefone: "(61) 98222-4455",
    categoria: "SUB_9",
    turma: "Terça e Quinta",
    horarioTreino: "15:30 às 16:45",
    turmaHorario: "Terça e Quinta - 15:30 às 16:45",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-20",
    taxaFrequencia: 91.0,
  },
  {
    id: 9,
    nome: "Murilo Albuquerque Castro",
    cpf: "063.112.908-62",
    dataNascimento: "2017-08-19",
    idade: 9,
    responsavel: "Carla Castro (Mãe)",
    telefone: "(61) 99333-6677",
    categoria: "SUB_9",
    turma: "Terça e Quinta",
    horarioTreino: "15:30 às 16:45",
    turmaHorario: "Terça e Quinta - 15:30 às 16:45",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-25",
    taxaFrequencia: 72.0,
    alertaFrequenciaBaixa: true,
  },
  {
    id: 10,
    nome: "Matheus Henrique Moreira",
    cpf: "039.812.556-78",
    dataNascimento: "2012-03-14",
    idade: 14,
    responsavel: "Sandra Moreira (Mãe)",
    telefone: "(61) 99233-4411",
    categoria: "SUB_15",
    turmaHorario: "Terça e Quinta - 14:30 às 16:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-20",
    taxaFrequencia: 96.0,
  },
  {
    id: 11,
    nome: "Gabriel dos Santos Lima",
    cpf: "042.990.112-33",
    dataNascimento: "2011-08-22",
    idade: 15,
    responsavel: "Antônio Lima (Pai)",
    telefone: "(61) 98511-7788",
    categoria: "SUB_15",
    turmaHorario: "Terça e Quinta - 14:30 às 16:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-22",
    taxaFrequencia: 71.0,
    alertaFrequenciaBaixa: true,
  },
  {
    id: 12,
    nome: "Pedro Henrique Carvalho",
    cpf: "049.223.778-19",
    dataNascimento: "2013-01-10",
    idade: 13,
    responsavel: "Luciana Carvalho (Mãe)",
    telefone: "(61) 98844-3322",
    categoria: "SUB_15",
    turmaHorario: "Terça e Quinta - 14:30 às 16:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-01",
    taxaFrequencia: 84.5,
  },
  {
    id: 13,
    nome: "Joaquim Barbosa Neto",
    cpf: "047.551.992-04",
    dataNascimento: "2012-10-20",
    idade: 14,
    responsavel: "Joaquim Barbosa Filho (Pai)",
    telefone: "(61) 99199-0011",
    categoria: "SUB_15",
    turma: "Turma B",
    horarioTreino: "14:30 às 16:00",
    turmaHorario: "Turma B - 14:30 às 16:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-03",
    taxaFrequencia: 90.0,
  },
  {
    id: 14,
    nome: "Felipe Augusto Barreto",
    cpf: "033.456.789-01",
    dataNascimento: "2009-10-21",
    idade: 17,
    responsavel: "Marcos Barreto (Pai)",
    telefone: "(61) 99311-5522",
    categoria: "SUB_17",
    turma: "Turma Única",
    horarioTreino: "16:00 às 17:30",
    turmaHorario: "Turma Única - 16:00 às 17:30",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-15",
    taxaFrequencia: 93.3,
  },
  {
    id: 15,
    nome: "Rodrigo Alencar Tavares",
    cpf: "036.789.012-34",
    dataNascimento: "2010-02-11",
    idade: 16,
    responsavel: "Eliane Alencar (Mãe)",
    telefone: "(61) 98422-9900",
    categoria: "SUB_17",
    turmaHorario: "Segunda e Quarta - 16:00 às 17:30",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-18",
    taxaFrequencia: 69.5,
    alertaFrequenciaBaixa: true,
  },
  {
    id: 16,
    nome: "Caio Vinicius Martins",
    cpf: "038.991.223-45",
    dataNascimento: "2009-12-04",
    idade: 17,
    responsavel: "Valéria Martins (Mãe)",
    telefone: "(61) 98112-8877",
    categoria: "SUB_17",
    turmaHorario: "Segunda e Quarta - 16:00 às 17:30",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-25",
    taxaFrequencia: 88.0,
  },
  {
    id: 17,
    nome: "Bruno Cesar Guimarães",
    cpf: "022.654.891-23",
    dataNascimento: "2004-10-19",
    idade: 22,
    responsavel: "Próprio (Maior de Idade)",
    telefone: "(61) 98155-3322",
    categoria: "ADULTO",
    turma: "Turma Noturna",
    horarioTreino: "19:30 às 21:00",
    turmaHorario: "Turma Noturna - 19:30 às 21:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-10",
    taxaFrequencia: 91.5,
  },
  {
    id: 18,
    nome: "Leandro Paiva Dantas",
    cpf: "019.883.221-99",
    dataNascimento: "2003-11-15",
    idade: 23,
    responsavel: "Próprio (Maior de Idade)",
    telefone: "(61) 99988-1122",
    categoria: "ADULTO",
    turmaHorario: "Terça e Quinta - 19:30 às 21:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-12",
    taxaFrequencia: 85.0,
  },
  {
    id: 19,
    nome: "Diego Armando Freitas",
    cpf: "025.123.445-66",
    dataNascimento: "2002-06-09",
    idade: 24,
    responsavel: "Próprio (Maior de Idade)",
    telefone: "(61) 98765-4321",
    categoria: "ADULTO",
    turmaHorario: "Terça e Quinta - 19:30 às 21:00",
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-02-02",
    taxaFrequencia: 87.5,
  },
  {
    id: 20,
    nome: "Guilherme Siqueira Lins",
    cpf: "031.554.887-12",
    dataNascimento: "2001-08-30",
    idade: 25,
    responsavel: "Próprio (Maior de Idade)",
    telefone: "(61) 99123-9988",
    categoria: "ADULTO",
    turmaHorario: "Terça e Quinta - 19:30 às 21:00",
    status: "INATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dataMatricula: "2026-01-08",
    taxaFrequencia: 60.0,
    alertaFrequenciaBaixa: true,
  }
];

export const INITIAL_COLABORADORES_DATA: Colaborador[] = [
  {
    id: 1,
    nome: "Prof. Ricardo Antunes Mendonça",
    cpf: "312.445.678-90",
    email: "ricardo.mendonca@portofc.org.br",
    telefone: "(61) 98111-2233",
    funcao: "Professor de Futebol de Base (Sub-7 e Sub-9)",
    tipoContratacao: "HORISTA",
    valorHora: 50.00,
    beneficios: 250.00,
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    dataAdmissao: "2026-01-10",
    dataNascimento: "1987-10-20",
    chavePix: "312.445.678-90",
  },
  {
    id: 2,
    nome: "Prof. Marcelo Vasconcelos",
    cpf: "421.998.112-05",
    email: "marcelo.vasconcelos@portofc.org.br",
    telefone: "(61) 99222-3344",
    funcao: "Professor Técnico Principal (Sub-15, Sub-17 e Adulto)",
    tipoContratacao: "HORISTA",
    valorHora: 60.00,
    beneficios: 300.00,
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    dataAdmissao: "2026-01-10",
    dataNascimento: "1984-10-23",
    chavePix: "marcelo.vasconcelos@portofc.org.br",
  },
  {
    id: 3,
    nome: "Fabrício Nogueira da Rocha",
    cpf: "218.665.432-11",
    email: "fabricio.rocha@portofc.org.br",
    telefone: "(61) 99333-4455",
    funcao: "Coordenador Pedagógico e Esportivo",
    tipoContratacao: "MENSALISTA",
    salarioFixo: 4500.00,
    beneficios: 500.00,
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    dataAdmissao: "2026-01-05",
    dataNascimento: "1981-05-14",
    chavePix: "+5561993334455",
  },
  {
    id: 4,
    nome: "Camila Duarte Peixoto",
    cpf: "541.223.789-40",
    email: "camila.duarte@portofc.org.br",
    telefone: "(61) 98444-5566",
    funcao: "Assistente Administrativa e de Prestação de Contas",
    tipoContratacao: "MENSALISTA",
    salarioFixo: 2200.00,
    beneficios: 350.00,
    status: "ATIVO",
    fotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    dataAdmissao: "2026-01-15",
    dataNascimento: "1993-08-30",
    chavePix: "camila.duarte@portofc.org.br",
  }
];

export const INITIAL_LANCAMENTOS_DATA: LancamentoFinanceiro[] = [
  {
    id: 1,
    tipo: "ENTRADA",
    descricao: "Repasse Convênio Esporte Cidadão - Parcela 01",
    categoria: "REPASSES",
    valor: 45000.00,
    dataVencimento: "2026-08-10",
    dataPagamento: "2026-08-10",
    formaPagamento: "TRANSFERENCIA",
    status: "PAGO",
    comprovanteUrl: "https://exemplo.com/comprovantes/repasse_01.pdf",
    dataCriacao: "2026-08-01",
  },
  {
    id: 2,
    tipo: "ENTRADA",
    descricao: "Patrocínio Master - Supermercados Central",
    categoria: "PATROCINIOS",
    valor: 12000.00,
    dataVencimento: "2026-09-05",
    dataPagamento: "2026-09-05",
    formaPagamento: "PIX",
    status: "PAGO",
    comprovanteUrl: "https://exemplo.com/comprovantes/patrocinio_central.pdf",
    dataCriacao: "2026-09-01",
  },
  {
    id: 3,
    tipo: "ENTRADA",
    descricao: "Campanha de Doações de Pais e Amigos do Clube",
    categoria: "DOACOES",
    valor: 3850.00,
    dataVencimento: "2026-09-20",
    dataPagamento: "2026-09-20",
    formaPagamento: "PIX",
    status: "PAGO",
    dataCriacao: "2026-09-15",
  },
  {
    id: 4,
    tipo: "ENTRADA",
    descricao: "Repasse Termo de Fomento - Parcela 02",
    categoria: "REPASSES",
    valor: 45000.00,
    dataVencimento: "2026-10-15",
    dataPagamento: "2026-10-15",
    formaPagamento: "TRANSFERENCIA",
    status: "PAGO",
    dataCriacao: "2026-10-01",
  },
  {
    id: 5,
    tipo: "ENTRADA",
    descricao: "Inscrições Torneio Beneficente Solidário",
    categoria: "EVENTOS",
    valor: 2500.00,
    dataVencimento: "2026-10-25",
    formaPagamento: "PIX",
    status: "PENDENTE",
    dataCriacao: "2026-10-05",
  },
  {
    id: 6,
    tipo: "SAIDA",
    descricao: "Confecção dos Kits de Uniformes Oficiais (120 jogos)",
    categoria: "UNIFORMES",
    valor: 8400.00,
    dataVencimento: "2026-08-15",
    dataPagamento: "2026-08-15",
    formaPagamento: "BOLETO",
    status: "PAGO",
    comprovanteUrl: "https://exemplo.com/comprovantes/nf_uniformes.pdf",
    dataCriacao: "2026-08-05",
  },
  {
    id: 7,
    tipo: "SAIDA",
    descricao: "Aquisição de Bolas Topper, Cones e Coletes",
    categoria: "MATERIAIS",
    valor: 3250.00,
    dataVencimento: "2026-08-22",
    dataPagamento: "2026-08-22",
    formaPagamento: "BOLETO",
    status: "PAGO",
    dataCriacao: "2026-08-10",
  },
  {
    id: 8,
    tipo: "SAIDA",
    descricao: "Folha de Pagamento Professores & Coordenação - Agosto",
    categoria: "SALARIOS",
    valor: 11600.00,
    dataVencimento: "2026-09-05",
    dataPagamento: "2026-09-05",
    formaPagamento: "TRANSFERENCIA",
    status: "PAGO",
    dataCriacao: "2026-08-31",
  },
  {
    id: 9,
    tipo: "SAIDA",
    descricao: "Aluguel do Campo de Grama Sintética e Quadra",
    categoria: "ADMINISTRATIVO",
    valor: 3500.00,
    dataVencimento: "2026-09-10",
    dataPagamento: "2026-09-10",
    formaPagamento: "BOLETO",
    status: "PAGO",
    dataCriacao: "2026-09-01",
  },
  {
    id: 10,
    tipo: "SAIDA",
    descricao: "Transporte e Lanches para Torneio Regional Sub-15",
    categoria: "TORNEIOS",
    valor: 1850.00,
    dataVencimento: "2026-09-25",
    dataPagamento: "2026-09-25",
    formaPagamento: "PIX",
    status: "PAGO",
    dataCriacao: "2026-09-20",
  },
  {
    id: 11,
    tipo: "SAIDA",
    descricao: "Folha de Pagamento Professores & Apoio - Setembro",
    categoria: "SALARIOS",
    valor: 11800.00,
    dataVencimento: "2026-10-05",
    dataPagamento: "2026-10-05",
    formaPagamento: "TRANSFERENCIA",
    status: "PAGO",
    dataCriacao: "2026-09-30",
  },
  {
    id: 12,
    tipo: "SAIDA",
    descricao: "Manutenção de Equipamentos e Redes de Traves",
    categoria: "MATERIAIS",
    valor: 820.00,
    dataVencimento: "2026-10-12",
    dataPagamento: "2026-10-12",
    formaPagamento: "PIX",
    status: "PAGO",
    dataCriacao: "2026-10-02",
  },
  {
    id: 13,
    tipo: "SAIDA",
    descricao: "Honorários de Contabilidade e Auditoria Fiscal",
    categoria: "ADMINISTRATIVO",
    valor: 1200.00,
    dataVencimento: "2026-10-20",
    formaPagamento: "BOLETO",
    status: "PENDENTE",
    dataCriacao: "2026-10-05",
  },
  {
    id: 14,
    tipo: "SAIDA",
    descricao: "Premiação e Troféus da Copa da Amizade",
    categoria: "EVENTOS",
    valor: 1600.00,
    dataVencimento: "2026-10-28",
    formaPagamento: "BOLETO",
    status: "PROGRAMADO",
    dataCriacao: "2026-10-05",
  },
  {
    id: 15,
    tipo: "SAIDA",
    descricao: "Lote Adicional de Uniformes de Treino (Tam 10 e 12)",
    categoria: "UNIFORMES",
    valor: 2400.00,
    dataVencimento: "2026-11-05",
    formaPagamento: "BOLETO",
    status: "PROGRAMADO",
    dataCriacao: "2026-10-05",
  }
];

export const INITIAL_MATERIAIS_DATA: Material[] = [
  { id: 1, nome: "Bolas de Futsal Penalty Max 500", categoria: "Bolas", quantidadeEstoque: 24, quantidadeMinima: 10, localArmazenamento: "Armário A1", valorUnitario: 149.90, valorTotal: 3597.60 },
  { id: 2, nome: "Bolas de Campo Topper Slick", categoria: "Bolas", quantidadeEstoque: 30, quantidadeMinima: 12, localArmazenamento: "Armário A2", valorUnitario: 119.50, valorTotal: 3585.00 },
  { id: 3, nome: "Coletes de Treino (Azul/Verde)", categoria: "Coletes", quantidadeEstoque: 60, quantidadeMinima: 20, localArmazenamento: "Gaveteiro B", valorUnitario: 18.00, valorTotal: 1080.00 },
  { id: 4, nome: "Cones Tradicionais e Pratos Demarcatórios", categoria: "Equipamentos", quantidadeEstoque: 120, quantidadeMinima: 40, localArmazenamento: "Caixa Central", valorUnitario: 6.50, valorTotal: 780.00 },
  { id: 5, nome: "Escadas de Agilidade e Coordenação", categoria: "Equipamentos", quantidadeEstoque: 8, quantidadeMinima: 4, localArmazenamento: "Suporte de Parede", valorUnitario: 75.00, valorTotal: 600.00 },
  { id: 6, nome: "Cronômetros Digitais Profissionais", categoria: "Acessórios", quantidadeEstoque: 5, quantidadeMinima: 2, localArmazenamento: "Armário do Professor", valorUnitario: 65.00, valorTotal: 325.00 },
  { id: 7, nome: "Kit de Primeiros Socorros e Gelo Instantâneo", categoria: "Saúde", quantidadeEstoque: 4, quantidadeMinima: 2, localArmazenamento: "Sala da Coordenação", valorUnitario: 110.00, valorTotal: 440.00 },
];

export const INITIAL_UNIFORMES_DATA: Uniforme[] = [
  { id: 1, tamanho: "Tam 6 (Sub-7)", quantidadeComprada: 25, quantidadeEntregue: 18, saldoEstoque: 7, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 65.00, valorTotal: 1625.00 },
  { id: 2, tamanho: "Tam 8 (Sub-9)", quantidadeComprada: 30, quantidadeEntregue: 24, saldoEstoque: 6, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 65.00, valorTotal: 1950.00 },
  { id: 3, tamanho: "Tam 10 (Sub-9)", quantidadeComprada: 25, quantidadeEntregue: 15, saldoEstoque: 10, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 65.00, valorTotal: 1625.00 },
  { id: 4, tamanho: "Tam 12 (Sub-15)", quantidadeComprada: 35, quantidadeEntregue: 28, saldoEstoque: 7, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 70.00, valorTotal: 2450.00 },
  { id: 5, tamanho: "Tam 14 (Sub-15)", quantidadeComprada: 30, quantidadeEntregue: 22, saldoEstoque: 8, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 70.00, valorTotal: 2100.00 },
  { id: 6, tamanho: "P (Sub-17)", quantidadeComprada: 25, quantidadeEntregue: 20, saldoEstoque: 5, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 75.00, valorTotal: 1875.00 },
  { id: 7, tamanho: "M (Sub-17/Adulto)", quantidadeComprada: 40, quantidadeEntregue: 32, saldoEstoque: 8, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 75.00, valorTotal: 3000.00 },
  { id: 8, tamanho: "G (Adulto)", quantidadeComprada: 30, quantidadeEntregue: 19, saldoEstoque: 11, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 75.00, valorTotal: 2250.00 },
  { id: 9, tamanho: "GG (Adulto)", quantidadeComprada: 15, quantidadeEntregue: 8, saldoEstoque: 7, descricao: "Kit Camisa, Calção e Meiões", valorUnitario: 75.00, valorTotal: 1125.00 },
];

export const INITIAL_FOLHAS_DATA: FolhaAula[] = [
  {
    id: 1,
    colaboradorId: 1,
    colaboradorNome: "Prof. Ricardo Antunes Mendonça",
    colaboradorFuncao: "Professor de Futebol de Base (Sub-7 e Sub-9)",
    colaboradorFotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    tipoContratacao: "HORISTA",
    mesReferencia: "2026-10",
    horasRegistradas: 40,
    valorHora: 50.00,
    totalBruto: 2000.00,
    diasTransporte: 16,
    valorDiarioTransporte: 11.00,
    passagem: 176.00,
    outrosBeneficios: 74.00,
    beneficios: 250.00,
    descontos: 150.00,
    liquidoPagar: 2100.00,
    status: "PAGO",
    dataPagamento: "2026-10-05",
  },
  {
    id: 2,
    colaboradorId: 2,
    colaboradorNome: "Prof. Marcelo Vasconcelos",
    colaboradorFuncao: "Professor Técnico Principal (Sub-15, Sub-17 e Adulto)",
    colaboradorFotoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    tipoContratacao: "HORISTA",
    mesReferencia: "2026-10",
    horasRegistradas: 48,
    valorHora: 60.00,
    totalBruto: 2880.00,
    diasTransporte: 20,
    valorDiarioTransporte: 11.00,
    passagem: 220.00,
    outrosBeneficios: 80.00,
    beneficios: 300.00,
    descontos: 200.00,
    liquidoPagar: 2980.00,
    status: "PENDENTE",
  },
  {
    id: 3,
    colaboradorId: 3,
    colaboradorNome: "Fabrício Nogueira da Rocha",
    colaboradorFuncao: "Coordenador Pedagógico e Esportivo",
    colaboradorFotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    tipoContratacao: "MENSALISTA",
    mesReferencia: "2026-10",
    horasRegistradas: 160,
    valorHora: 28.12,
    totalBruto: 4500.00,
    diasTransporte: 22,
    valorDiarioTransporte: 11.00,
    passagem: 242.00,
    outrosBeneficios: 258.00,
    beneficios: 500.00,
    descontos: 450.00,
    liquidoPagar: 4550.00,
    status: "PAGO",
    dataPagamento: "2026-10-05",
  },
  {
    id: 4,
    colaboradorId: 4,
    colaboradorNome: "Camila Duarte Peixoto",
    colaboradorFuncao: "Assistente Administrativa e de Prestação de Contas",
    colaboradorFotoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    tipoContratacao: "MENSALISTA",
    mesReferencia: "2026-10",
    horasRegistradas: 160,
    valorHora: 13.75,
    totalBruto: 2200.00,
    diasTransporte: 20,
    valorDiarioTransporte: 11.00,
    passagem: 220.00,
    outrosBeneficios: 130.00,
    beneficios: 350.00,
    descontos: 180.00,
    liquidoPagar: 2370.00,
    status: "PAGO",
    dataPagamento: "2026-10-05",
  }
];

export const INITIAL_ORCAMENTOS_DATA: OrcamentoMes[] = [
  { mesReferencia: "2026-08", previsto: 30000.00, realizado: 23250.00, diferenca: 6750.00 },
  { mesReferencia: "2026-09", previsto: 25000.00, realizado: 16950.00, diferenca: 8050.00 },
  { mesReferencia: "2026-10", previsto: 28000.00, realizado: 17820.00, diferenca: 10180.00 },
  { mesReferencia: "2026-11", previsto: 28000.00, realizado: 18500.00, diferenca: 9500.00 },
  { mesReferencia: "2026-12", previsto: 32000.00, realizado: 24100.00, diferenca: 7900.00 },
  { mesReferencia: "2027-01", previsto: 22000.00, realizado: 14800.00, diferenca: 7200.00 },
  { mesReferencia: "2027-02", previsto: 25000.00, realizado: 18200.00, diferenca: 6800.00 },
  { mesReferencia: "2027-03", previsto: 28000.00, realizado: 19400.00, diferenca: 8600.00 },
  { mesReferencia: "2027-04", previsto: 27000.00, realizado: 18900.00, diferenca: 8100.00 },
  { mesReferencia: "2027-05", previsto: 28000.00, realizado: 20100.00, diferenca: 7900.00 },
  { mesReferencia: "2027-06", previsto: 29000.00, realizado: 21500.00, diferenca: 7500.00 },
  { mesReferencia: "2027-07", previsto: 30000.00, realizado: 22000.00, diferenca: 8000.00 },
];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  saldoDisponivel: 64630.00,
  saldoLivre: 59430.00,
  totalReceitasPagas: 105850.00,
  totalDespesasPagas: 41220.00,
  totalDespesasComprometidas: 5200.00,
  totalAlunosAtivos: 19,
  taxaFrequenciaGlobal: 88.5,
  despesasPorCategoria: [
    { categoria: "SALARIOS", total: 23400.00, percentual: 56.8 },
    { categoria: "UNIFORMES", total: 8400.00, percentual: 20.4 },
    { categoria: "ADMINISTRATIVO", total: 4700.00, percentual: 11.4 },
    { categoria: "MATERIAIS", total: 4070.00, percentual: 9.9 },
    { categoria: "TORNEIOS", total: 1850.00, percentual: 4.5 },
    { categoria: "EVENTOS", total: 1600.00, percentual: 3.9 },
  ],
  execucaoOrcamentaria: [
    { mesReferencia: "2026-08", previsto: 30000.00, realizado: 23250.00, diferenca: 6750.00 },
    { mesReferencia: "2026-09", previsto: 25000.00, realizado: 16950.00, diferenca: 8050.00 },
    { mesReferencia: "2026-10", previsto: 28000.00, realizado: 17820.00, diferenca: 10180.00 },
    { mesReferencia: "2026-11", previsto: 28000.00, realizado: 18500.00, diferenca: 9500.00 },
    { mesReferencia: "2026-12", previsto: 32000.00, realizado: 24100.00, diferenca: 7900.00 },
  ],
};

// Storage Helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar localmente:', e);
  }
}

// Alunos Fallback Storage
export const fallbackStorage = {
  getAlunos(): Aluno[] {
    return getStored('portofc_alunos', INITIAL_ALUNOS_DATA);
  },
  saveAluno(aluno: Partial<Aluno>): Aluno {
    const list = this.getAlunos();
    if (aluno.id) {
      const idx = list.findIndex(a => a.id === aluno.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...aluno } as Aluno;
      } else {
        list.push(aluno as Aluno);
      }
    } else {
      const newAluno = { ...aluno, id: Date.now() } as Aluno;
      list.unshift(newAluno);
      setStored('portofc_alunos', list);
      return newAluno;
    }
    setStored('portofc_alunos', list);
    return list.find(a => a.id === aluno.id)!;
  },
  deleteAluno(id: number): void {
    const list = this.getAlunos().filter(a => a.id !== id);
    setStored('portofc_alunos', list);
  },

  // Colaboradores
  getColaboradores(): Colaborador[] {
    return getStored('portofc_colaboradores', INITIAL_COLABORADORES_DATA);
  },
  saveColaborador(c: Partial<Colaborador>): Colaborador {
    const list = this.getColaboradores();
    if (c.id) {
      const idx = list.findIndex(item => item.id === c.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...c } as Colaborador;
      else list.push(c as Colaborador);
    } else {
      const newItem = { ...c, id: Date.now() } as Colaborador;
      list.unshift(newItem);
      setStored('portofc_colaboradores', list);
      return newItem;
    }
    setStored('portofc_colaboradores', list);
    return list.find(item => item.id === c.id)!;
  },
  deleteColaborador(id: number): void {
    const list = this.getColaboradores().filter(c => c.id !== id);
    setStored('portofc_colaboradores', list);
  },

  // Folhas
  getFolhas(): FolhaAula[] {
    return getStored('portofc_folhas', INITIAL_FOLHAS_DATA);
  },
  saveFolha(f: Partial<FolhaAula>): FolhaAula {
    const list = this.getFolhas();
    if (f.id) {
      const idx = list.findIndex(item => item.id === f.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...f } as FolhaAula;
      else list.push(f as FolhaAula);
    } else {
      const newItem = { ...f, id: Date.now() } as FolhaAula;
      list.unshift(newItem);
      setStored('portofc_folhas', list);
      return newItem;
    }
    setStored('portofc_folhas', list);
    return list.find(item => item.id === f.id)!;
  },
  updateFolhaStatus(id: number, status: any): FolhaAula {
    const list = this.getFolhas();
    const item = list.find(f => f.id === id);
    if (item) {
      item.status = status;
      if (status === 'PAGO') item.dataPagamento = new Date().toISOString().split('T')[0];
      setStored('portofc_folhas', list);
      return item;
    }
    return { ...INITIAL_FOLHAS_DATA[0], id, status };
  },

  // Financeiro
  getLancamentos(): LancamentoFinanceiro[] {
    return getStored('portofc_lancamentos', INITIAL_LANCAMENTOS_DATA);
  },
  saveLancamento(l: Partial<LancamentoFinanceiro>): LancamentoFinanceiro {
    const list = this.getLancamentos();
    if (l.id) {
      const idx = list.findIndex(item => item.id === l.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...l } as LancamentoFinanceiro;
      else list.push(l as LancamentoFinanceiro);
    } else {
      const newItem = { ...l, id: Date.now() } as LancamentoFinanceiro;
      list.unshift(newItem);
      setStored('portofc_lancamentos', list);
      return newItem;
    }
    setStored('portofc_lancamentos', list);
    return list.find(item => item.id === l.id)!;
  },
  deleteLancamento(id: number): void {
    const list = this.getLancamentos().filter(l => l.id !== id);
    setStored('portofc_lancamentos', list);
  },
  getOrcamentos(): OrcamentoMes[] {
    return getStored('portofc_orcamentos', INITIAL_ORCAMENTOS_DATA);
  },

  // Materiais
  getMateriais(): Material[] {
    return getStored('portofc_materiais', INITIAL_MATERIAIS_DATA);
  },
  saveMaterial(m: Partial<Material>): Material {
    const list = this.getMateriais();
    if (m.id) {
      const idx = list.findIndex(item => item.id === m.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...m } as Material;
      else list.push(m as Material);
    } else {
      const newItem = { ...m, id: Date.now() } as Material;
      list.unshift(newItem);
      setStored('portofc_materiais', list);
      return newItem;
    }
    setStored('portofc_materiais', list);
    return list.find(item => item.id === m.id)!;
  },
  deleteMaterial(id: number): void {
    const list = this.getMateriais().filter(m => m.id !== id);
    setStored('portofc_materiais', list);
  },

  // Uniformes
  getUniformes(): Uniforme[] {
    return getStored('portofc_uniformes', INITIAL_UNIFORMES_DATA);
  },
  saveUniforme(u: Partial<Uniforme>): Uniforme {
    const list = this.getUniformes();
    if (u.id) {
      const idx = list.findIndex(item => item.id === u.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...u } as Uniforme;
      else list.push(u as Uniforme);
    } else {
      const newItem = { ...u, id: Date.now() } as Uniforme;
      list.unshift(newItem);
      setStored('portofc_uniformes', list);
      return newItem;
    }
    setStored('portofc_uniformes', list);
    return list.find(item => item.id === u.id)!;
  },
  deleteUniforme(id: number): void {
    const list = this.getUniformes().filter(u => u.id !== id);
    setStored('portofc_uniformes', list);
  },
  entregarUniforme(id: number, qtd: number): Uniforme {
    const list = this.getUniformes();
    const item = list.find(u => u.id === id);
    if (item) {
      item.quantidadeEntregue = (item.quantidadeEntregue || 0) + qtd;
      item.saldoEstoque = Math.max(0, (item.quantidadeComprada || 0) - item.quantidadeEntregue);
      setStored('portofc_uniformes', list);
      return item;
    }
    return INITIAL_UNIFORMES_DATA[0];
  },

  // Dashboard Stats recalculadas dinamicamente
  getDashboardStats(): DashboardStats {
    const lancamentos = this.getLancamentos();
    const alunos = this.getAlunos();
    
    let totalReceitasPagas = 0;
    let totalDespesasPagas = 0;
    let totalDespesasComprometidas = 0;

    lancamentos.forEach(l => {
      if (l.tipo === 'ENTRADA' && l.status === 'PAGO') totalReceitasPagas += Number(l.valor) || 0;
      if (l.tipo === 'SAIDA' && l.status === 'PAGO') totalDespesasPagas += Number(l.valor) || 0;
      if (l.tipo === 'SAIDA' && (l.status === 'PENDENTE' || l.status === 'PROGRAMADO')) {
        totalDespesasComprometidas += Number(l.valor) || 0;
      }
    });

    const saldoDisponivel = totalReceitasPagas - totalDespesasPagas;
    const saldoLivre = saldoDisponivel - totalDespesasComprometidas;
    const alunosAtivos = alunos.filter(a => a.status === 'ATIVO').length;

    return {
      saldoDisponivel: saldoDisponivel || INITIAL_DASHBOARD_STATS.saldoDisponivel,
      saldoLivre: saldoLivre || INITIAL_DASHBOARD_STATS.saldoLivre,
      totalReceitasPagas: totalReceitasPagas || INITIAL_DASHBOARD_STATS.totalReceitasPagas,
      totalDespesasPagas: totalDespesasPagas || INITIAL_DASHBOARD_STATS.totalDespesasPagas,
      totalDespesasComprometidas: totalDespesasComprometidas || INITIAL_DASHBOARD_STATS.totalDespesasComprometidas,
      totalAlunosAtivos: alunosAtivos || INITIAL_DASHBOARD_STATS.totalAlunosAtivos,
      taxaFrequenciaGlobal: INITIAL_DASHBOARD_STATS.taxaFrequenciaGlobal,
      despesasPorCategoria: INITIAL_DASHBOARD_STATS.despesasPorCategoria,
      execucaoOrcamentaria: INITIAL_DASHBOARD_STATS.execucaoOrcamentaria,
    };
  }
};

