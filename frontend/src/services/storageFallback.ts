import {
  Aluno,
  Colaborador,
  FolhaAula,
  LancamentoFinanceiro,
  Material,
  Uniforme,
  OrcamentoMes,
  DashboardStats,
  CategoriaDespesa,
} from '../types';

export const INITIAL_ALUNOS_DATA: Aluno[] = [];
export const INITIAL_COLABORADORES_DATA: Colaborador[] = [];
export const INITIAL_LANCAMENTOS_DATA: LancamentoFinanceiro[] = [];
export const INITIAL_MATERIAIS_DATA: Material[] = [];
export const INITIAL_UNIFORMES_DATA: Uniforme[] = [];
export const INITIAL_FOLHAS_DATA: FolhaAula[] = [];
export const INITIAL_ORCAMENTOS_DATA: OrcamentoMes[] = [];

export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  saldoDisponivel: 120000,
  saldoLivre: 120000,
  totalReceitasPagas: 0,
  totalDespesasPagas: 0,
  totalDespesasComprometidas: 0,
  orcamentoPrevisto: 120000,
  totalAlunosAtivos: 0,
  taxaFrequenciaGlobal: 0,
  despesasPorCategoria: [],
  execucaoOrcamentaria: [],
};

// Purge automático de dados artificiais legados gravados em sessões anteriores do localStorage
(function purgeLegacyMockData() {
  if (typeof window === 'undefined') return;
  const CLEANUP_KEY = 'portofc_cleaned_mocks_v4';
  if (!localStorage.getItem(CLEANUP_KEY)) {
    const mockAlunoNames = [
      'Lucas Gabriel Silveira',
      'Enzo Miguel Ribeiro',
      'Theo Henrique Souza',
      'Davi Lucca Farias',
      'Bernardo Ramos Costa',
    ];
    const storedAlunos = localStorage.getItem('portofc_alunos');
    if (storedAlunos && mockAlunoNames.some((name) => storedAlunos.includes(name))) {
      try {
        const parsed = JSON.parse(storedAlunos);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (a: any) => !mockAlunoNames.includes(a.nome) && (!a.id || a.id > 25)
          );
          localStorage.setItem('portofc_alunos', JSON.stringify(filtered));
        }
      } catch {
        localStorage.removeItem('portofc_alunos');
      }
    }

    const mockColabNames = [
      'Prof. Ricardo Antunes Mendonça',
      'Prof. Marcelo Vasconcelos',
      'Fabrício Nogueira da Rocha',
      'Carlos Eduardo Santos',
    ];
    const storedColabs = localStorage.getItem('portofc_colaboradores');
    if (storedColabs && mockColabNames.some((name) => storedColabs.includes(name))) {
      try {
        const parsed = JSON.parse(storedColabs);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (c: any) => !mockColabNames.includes(c.nome) && (!c.id || c.id > 10)
          );
          localStorage.setItem('portofc_colaboradores', JSON.stringify(filtered));
        }
      } catch {
        localStorage.removeItem('portofc_colaboradores');
      }
    }

    const mockLancamentoDesc = [
      'Repasse Emenda Parlamentar - Parcela 01',
      'Aquisição de Bolas Oficiais Penalty',
      'Locação de Van - Torneio Regional',
      'Aluguel do Campo Sintético',
    ];
    const storedLancs = localStorage.getItem('portofc_lancamentos');
    if (storedLancs && mockLancamentoDesc.some((desc) => storedLancs.includes(desc))) {
      try {
        const parsed = JSON.parse(storedLancs);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (l: any) => !mockLancamentoDesc.some((m) => l.descricao?.includes(m)) && (!l.id || l.id > 50)
          );
          localStorage.setItem('portofc_lancamentos', JSON.stringify(filtered));
        }
      } catch {
        localStorage.removeItem('portofc_lancamentos');
      }
    }

    const storedMateriais = localStorage.getItem('portofc_materiais');
    if (storedMateriais && storedMateriais.includes('Bolas de Futebol Campo')) {
      localStorage.removeItem('portofc_materiais');
    }

    const storedUniformes = localStorage.getItem('portofc_uniformes');
    if (storedUniformes && storedUniformes.includes('Tamanho 08 (Sub-7)')) {
      localStorage.removeItem('portofc_uniformes');
    }

    localStorage.removeItem('portofc_dashboard_stats');
    localStorage.removeItem('portofc_orcamentos');
    localStorage.removeItem('portofc_folhas');
    localStorage.setItem(CLEANUP_KEY, 'true');
  }
})();

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
      const idx = list.findIndex((a) => a.id === aluno.id);
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
    return list.find((a) => a.id === aluno.id)!;
  },
  deleteAluno(id: number): void {
    const list = this.getAlunos().filter((a) => a.id !== id);
    setStored('portofc_alunos', list);
  },

  // Colaboradores
  getColaboradores(): Colaborador[] {
    return getStored('portofc_colaboradores', INITIAL_COLABORADORES_DATA);
  },
  saveColaborador(c: Partial<Colaborador>): Colaborador {
    const list = this.getColaboradores();
    if (c.id) {
      const idx = list.findIndex((item) => item.id === c.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...c } as Colaborador;
      else list.push(c as Colaborador);
    } else {
      const newItem = { ...c, id: Date.now() } as Colaborador;
      list.unshift(newItem);
      setStored('portofc_colaboradores', list);
      return newItem;
    }
    setStored('portofc_colaboradores', list);
    return list.find((item) => item.id === c.id)!;
  },
  deleteColaborador(id: number): void {
    const list = this.getColaboradores().filter((c) => c.id !== id);
    setStored('portofc_colaboradores', list);
    const folhas = this.getFolhas().filter((f) => f.colaboradorId !== id);
    setStored('portofc_folhas', folhas);
  },

  // Folhas
  deleteFolha(id: number): void {
    const list = this.getFolhas().filter((f) => f.id !== id);
    setStored('portofc_folhas', list);
  },
  getFolhas(): FolhaAula[] {
    return getStored('portofc_folhas', INITIAL_FOLHAS_DATA);
  },
  saveFolha(f: Partial<FolhaAula>): FolhaAula {
    const list = this.getFolhas();
    if (f.id) {
      const idx = list.findIndex((item) => item.id === f.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...f } as FolhaAula;
      else list.push(f as FolhaAula);
    } else {
      const newItem = { ...f, id: Date.now() } as FolhaAula;
      list.unshift(newItem);
      setStored('portofc_folhas', list);
      return newItem;
    }
    setStored('portofc_folhas', list);
    return list.find((item) => item.id === f.id)!;
  },
  updateFolhaStatus(id: number, status: any): FolhaAula {
    const list = this.getFolhas();
    const item = list.find((f) => f.id === id);
    if (item) {
      item.status = status;
      if (status === 'PAGO') item.dataPagamento = new Date().toISOString().split('T')[0];
      setStored('portofc_folhas', list);
      return item;
    }
    return { id, status, colaboradorId: 0, colaboradorNome: '', mesReferencia: '', valorTotal: 0 } as unknown as FolhaAula;
  },

  // Financeiro
  getLancamentos(): LancamentoFinanceiro[] {
    return getStored('portofc_lancamentos', INITIAL_LANCAMENTOS_DATA);
  },
  saveLancamento(l: Partial<LancamentoFinanceiro>): LancamentoFinanceiro {
    const list = this.getLancamentos();
    if (l.id) {
      const idx = list.findIndex((item) => item.id === l.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...l } as LancamentoFinanceiro;
      else list.push(l as LancamentoFinanceiro);
    } else {
      const newItem = { ...l, id: Date.now() } as LancamentoFinanceiro;
      list.unshift(newItem);
      setStored('portofc_lancamentos', list);
      return newItem;
    }
    setStored('portofc_lancamentos', list);
    return list.find((item) => item.id === l.id)!;
  },
  deleteLancamento(id: number): void {
    const list = this.getLancamentos().filter((l) => l.id !== id);
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
      const idx = list.findIndex((item) => item.id === m.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...m } as Material;
      else list.push(m as Material);
    } else {
      const newItem = { ...m, id: Date.now() } as Material;
      list.unshift(newItem);
      setStored('portofc_materiais', list);
      return newItem;
    }
    setStored('portofc_materiais', list);
    return list.find((item) => item.id === m.id)!;
  },
  deleteMaterial(id: number): void {
    const list = this.getMateriais().filter((m) => m.id !== id);
    setStored('portofc_materiais', list);
  },

  // Uniformes
  getUniformes(): Uniforme[] {
    return getStored('portofc_uniformes', INITIAL_UNIFORMES_DATA);
  },
  saveUniforme(u: Partial<Uniforme>): Uniforme {
    const list = this.getUniformes();
    if (u.id) {
      const idx = list.findIndex((item) => item.id === u.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...u } as Uniforme;
      else list.push(u as Uniforme);
    } else {
      const newItem = { ...u, id: Date.now() } as Uniforme;
      list.unshift(newItem);
      setStored('portofc_uniformes', list);
      return newItem;
    }
    setStored('portofc_uniformes', list);
    return list.find((item) => item.id === u.id)!;
  },
  deleteUniforme(id: number): void {
    const list = this.getUniformes().filter((u) => u.id !== id);
    setStored('portofc_uniformes', list);
  },
  entregarUniforme(id: number, qtd: number): Uniforme {
    const list = this.getUniformes();
    const item = list.find((u) => u.id === id);
    if (item) {
      item.quantidadeEntregue = (item.quantidadeEntregue || 0) + qtd;
      item.saldoEstoque = Math.max(0, (item.quantidadeComprada || 0) - item.quantidadeEntregue);
      setStored('portofc_uniformes', list);
      return item;
    }
    return { id, tamanho: 'Padrão', quantidadeComprada: 0, quantidadeEntregue: qtd, saldoEstoque: 0 };
  },

  // Dashboard Stats calculadas 100% dinamicamente a partir dos dados reais do sistema
  getDashboardStats(): DashboardStats {
    const lancamentos = this.getLancamentos();
    const alunos = this.getAlunos();
    const colaboradores = this.getColaboradores();
    const folhas = this.getFolhas();

    let totalReceitasPagas = 0;
    let totalDespesasPagas = 0;
    let totalDespesasComprometidas = 0;
    const despesasPorCatMap: Record<string, number> = {};

    lancamentos.forEach((l) => {
      const valor = Number(l.valor) || 0;
      if (l.tipo === 'ENTRADA') {
        if (l.status === 'PAGO') totalReceitasPagas += valor;
      } else if (l.tipo === 'SAIDA') {
        if (l.status === 'PAGO') {
          totalDespesasPagas += valor;
          const cat = (l.categoria || 'OUTROS').toUpperCase();
          despesasPorCatMap[cat] = (despesasPorCatMap[cat] || 0) + valor;
        } else if (l.status === 'PENDENTE' || l.status === 'PROGRAMADO') {
          totalDespesasComprometidas += valor;
        }
      }
    });

    // Somar comprometido de colaboradores ativos com pagamentos pendentes
    colaboradores
      .filter((c) => c.status === 'ATIVO')
      .forEach((colab) => {
        const valorSalario =
          colab.tipoContratacao === 'MENSALISTA'
            ? (Number(colab.salarioFixo) || 0) + (Number(colab.beneficios) || 0)
            : (Number(colab.valorHora) || 0) * 40 + (Number(colab.beneficios) || 0);

        const jaPagoNoLancamento = lancamentos.some(
          (l) =>
            l.tipo === 'SAIDA' &&
            l.status === 'PAGO' &&
            l.categoria === 'SALARIOS' &&
            l.descricao?.toLowerCase().includes(colab.nome.toLowerCase())
        );
        const jaPagoNaFolha = folhas.some(
          (f) => f.colaboradorId === colab.id && f.status === 'PAGO'
        );

        if (!jaPagoNoLancamento && !jaPagoNaFolha && valorSalario > 0) {
          const jaContadoPendente = lancamentos.some(
            (l) =>
              l.tipo === 'SAIDA' &&
              (l.status === 'PENDENTE' || l.status === 'PROGRAMADO') &&
              l.descricao?.toLowerCase().includes(colab.nome.toLowerCase())
          );
          if (!jaContadoPendente) {
            totalDespesasComprometidas += valorSalario;
          }
        }
      });

    const getOrcamentoTeto = (): number => {
      try {
        const savedConfig = localStorage.getItem('portofc_teto_config');
        if (savedConfig) {
          const cfg = JSON.parse(savedConfig);
          if (cfg && Number(cfg.total) > 0) return Number(cfg.total);
        }
        const savedRubricas = localStorage.getItem('portofc_matriz_rubricas');
        if (savedRubricas) {
          const rubricas = JSON.parse(savedRubricas);
          if (Array.isArray(rubricas) && rubricas.length > 0) {
            const soma = rubricas.reduce(
              (acc: number, r: { previsto?: number }) => acc + (Number(r.previsto) || 0),
              0
            );
            if (soma > 0) return soma;
          }
        }
      } catch (e) {
        // ignore
      }
      return 120000;
    };

    const orcamentoPrevisto = getOrcamentoTeto();
    // Se houver receitas (ENTRADA) lançadas, utiliza-as; caso contrário, toma como base o teto global da emenda pactuada
    const recursoBase = totalReceitasPagas > 0 ? totalReceitasPagas : orcamentoPrevisto;
    const saldoDisponivel = recursoBase - totalDespesasPagas;
    const saldoLivre = saldoDisponivel - totalDespesasComprometidas;
    const totalAlunosAtivos = alunos.filter((a) => a.status === 'ATIVO').length;

    let taxaFrequenciaGlobal = 0;
    const alunosComTaxa = alunos.filter(
      (a) => a.status === 'ATIVO' && a.taxaFrequencia !== undefined && a.taxaFrequencia !== null
    );
    if (alunosComTaxa.length > 0) {
      const soma = alunosComTaxa.reduce((acc, a) => acc + (a.taxaFrequencia || 0), 0);
      taxaFrequenciaGlobal = Math.round((soma / alunosComTaxa.length) * 10) / 10;
    }

    const totalDespesasParaPct = totalDespesasPagas > 0 ? totalDespesasPagas : 1;
    const despesasPorCategoria: CategoriaDespesa[] = Object.entries(despesasPorCatMap).map(
      ([categoria, total]) => ({
        categoria,
        total,
        percentual: Math.round((total / totalDespesasParaPct) * 1000) / 10,
      })
    );

    const mesesMap: Record<string, { previsto: number; realizado: number }> = {};
    lancamentos.forEach((l) => {
      const dataRef = l.dataPagamento || l.dataVencimento || '';
      if (dataRef.length >= 7) {
        const mesKey = dataRef.substring(0, 7);
        if (!mesesMap[mesKey]) mesesMap[mesKey] = { previsto: 0, realizado: 0 };
        const val = Number(l.valor) || 0;
        if (l.tipo === 'SAIDA') {
          if (l.status === 'PAGO') mesesMap[mesKey].realizado += val;
          else mesesMap[mesKey].previsto += val;
        }
      }
    });

    const execucaoOrcamentaria: OrcamentoMes[] = Object.entries(mesesMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mesReferencia, dados]) => ({
        mesReferencia,
        previsto: dados.previsto,
        realizado: dados.realizado,
        diferenca: dados.previsto - dados.realizado,
      }));

    return {
      saldoDisponivel,
      saldoLivre,
      totalReceitasPagas,
      totalDespesasPagas,
      totalDespesasComprometidas,
      orcamentoPrevisto,
      totalAlunosAtivos,
      taxaFrequenciaGlobal,
      despesasPorCategoria,
      execucaoOrcamentaria,
    };
  },
};
