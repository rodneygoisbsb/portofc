import { Aluno, Colaborador, FolhaAula, LancamentoFinanceiro, Material, Uniforme, DashboardStats, CategoriaAluno, CategoriaDespesa, ChamadaItem } from '../types';
import { INITIAL_ALUNOS, INITIAL_COLABORADORES, INITIAL_FOLHAS, INITIAL_LANCAMENTOS, INITIAL_MATERIAIS, INITIAL_UNIFORMES, INITIAL_ORCAMENTOS, INITIAL_CHAMADAS_HISTORICO } from './mockData';

const STORAGE_KEYS = {
  ALUNOS: 'portofc_alunos',
  COLABORADORES: 'portofc_colaboradores',
  FOLHAS: 'portofc_folhas',
  LANCAMENTOS: 'portofc_lancamentos',
  MATERIAIS: 'portofc_materiais',
  UNIFORMES: 'portofc_uniformes',
  CHAMADAS: 'portofc_chamadas_historico',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao salvar no localStorage', e);
  }
}

export const MockStorage = {
  getAlunos(categoria?: CategoriaAluno, busca?: string): Aluno[] {
    let list = getStored<Aluno[]>(STORAGE_KEYS.ALUNOS, INITIAL_ALUNOS);

    // Garante que novos alunos mockados (ex: Sub-9 IDs 18, 19, 20) existam mesmo com cache no localStorage
    const existingIds = new Set(list.map((a) => a.id));
    const missing = INITIAL_ALUNOS.filter((a) => !existingIds.has(a.id));
    let changed = false;

    if (missing.length > 0) {
      list = [...list, ...missing];
      changed = true;
    }

    const simulatedBirthdays: Record<number, string> = {
      1: '2019-10-17', // SUB_7 (Hoje!)
      4: '2017-10-22', // SUB_9 (em 5 dias)
      10: '2012-10-20', // SUB_15 (em 3 dias)
      11: '2009-10-21', // SUB_17 (em 4 dias)
      14: '2004-10-19', // ADULTO (em 2 dias)
    };

    list = list.map((a) => {
      let dataNascimento = simulatedBirthdays[a.id] || a.dataNascimento;
      let turma = a.turma;
      let horarioTreino = a.horarioTreino;

      // Normaliza Sub-9 inicial para Segunda e Quarta
      if (a.categoria === 'SUB_9' && (a.id === 4 || a.id === 5 || a.id === 6)) {
        if (turma === 'Turma A' || !turma) {
          turma = 'Segunda e Quarta';
          horarioTreino = '09:00 às 10:15';
          changed = true;
        }
      }

      if ((!turma || !horarioTreino) && a.turmaHorario && a.turmaHorario.includes(' - ')) {
        const parts = a.turmaHorario.split(' - ');
        turma = turma || parts[0]?.trim();
        horarioTreino = horarioTreino || parts.slice(1).join(' - ')?.trim();
      }

      return {
        ...a,
        turma,
        horarioTreino,
        dataNascimento,
      };
    });

    if (changed) {
      setStored(STORAGE_KEYS.ALUNOS, list);
    }
    if (categoria) {
      list = list.filter(a => a.categoria === categoria);
    }
    if (busca && busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter(a => a.nome.toLowerCase().includes(q) || a.responsavel.toLowerCase().includes(q));
    }
    return list;
  },

  saveAluno(alunoData: Partial<Aluno>): Aluno {
    const list = getStored<Aluno[]>(STORAGE_KEYS.ALUNOS, INITIAL_ALUNOS);
    const turmaCalculada = alunoData.turma?.trim();
    const horarioCalculado = alunoData.horarioTreino?.trim();
    const turmaHorarioFinal = alunoData.turmaHorario || (turmaCalculada && horarioCalculado ? `${turmaCalculada} - ${horarioCalculado}` : turmaCalculada || horarioCalculado);

    if (alunoData.id) {
      const index = list.findIndex(a => a.id === alunoData.id);
      if (index !== -1) {
        list[index] = {
          ...list[index],
          ...alunoData,
          turma: turmaCalculada,
          horarioTreino: horarioCalculado,
          turmaHorario: turmaHorarioFinal,
        } as Aluno;
        setStored(STORAGE_KEYS.ALUNOS, list);
        return list[index];
      }
    }
    const newId = list.length > 0 ? Math.max(...list.map(a => a.id)) + 1 : 1;
    const newAluno: Aluno = {
      id: newId,
      nome: alunoData.nome || '',
      cpf: alunoData.cpf,
      dataNascimento: alunoData.dataNascimento || '2015-01-01',
      idade: 10,
      telefone: alunoData.telefone,
      responsavel: alunoData.responsavel || '',
      categoria: alunoData.categoria || 'SUB_9',
      turma: turmaCalculada,
      horarioTreino: horarioCalculado,
      turmaHorario: turmaHorarioFinal,
      status: alunoData.status || 'ATIVO',
      fotoUrl: alunoData.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      dataMatricula: new Date().toISOString().split('T')[0],
      observacoesMedicas: alunoData.observacoesMedicas,
      taxaFrequencia: 100,
      alertaFrequenciaBaixa: false,
    };
    list.unshift(newAluno);
    setStored(STORAGE_KEYS.ALUNOS, list);
    return newAluno;
  },

  deleteAluno(id: number): void {
    const list = getStored<Aluno[]>(STORAGE_KEYS.ALUNOS, INITIAL_ALUNOS);
    setStored(STORAGE_KEYS.ALUNOS, list.filter(a => a.id !== id));
  },

  getColaboradores(busca?: string): Colaborador[] {
    let list = getStored<Colaborador[]>(STORAGE_KEYS.COLABORADORES, INITIAL_COLABORADORES);
    if (busca && busca.trim()) {
      const q = busca.toLowerCase();
      list = list.filter(c => c.nome.toLowerCase().includes(q) || c.funcao.toLowerCase().includes(q));
    }
    return list;
  },

  saveColaborador(data: Partial<Colaborador>): Colaborador {
    const list = getStored<Colaborador[]>(STORAGE_KEYS.COLABORADORES, INITIAL_COLABORADORES);
    if (data.id) {
      const index = list.findIndex(c => c.id === data.id);
      if (index !== -1) {
        list[index] = { ...list[index], ...data } as Colaborador;
        setStored(STORAGE_KEYS.COLABORADORES, list);
        return list[index];
      }
    }
    const newId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newColab: Colaborador = {
      id: newId,
      nome: data.nome || '',
      cpf: data.cpf,
      email: data.email,
      telefone: data.telefone,
      funcao: data.funcao || 'Professor',
      tipoContratacao: data.tipoContratacao || 'HORISTA',
      valorHora: data.valorHora,
      salarioFixo: data.salarioFixo,
      beneficios: data.beneficios || 0,
      status: data.status || 'ATIVO',
      fotoUrl: data.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      dataAdmissao: new Date().toISOString().split('T')[0],
    };
    list.push(newColab);
    setStored(STORAGE_KEYS.COLABORADORES, list);
    return newColab;
  },

  getFolhas(mesReferencia?: string): FolhaAula[] {
    let list = getStored<FolhaAula[]>(STORAGE_KEYS.FOLHAS, INITIAL_FOLHAS);
    if (mesReferencia) {
      list = list.filter(f => f.mesReferencia === mesReferencia);
    }
    return list;
  },

  updateFolhaStatus(id: number, status: 'PAGO' | 'PENDENTE'): FolhaAula {
    const list = getStored<FolhaAula[]>(STORAGE_KEYS.FOLHAS, INITIAL_FOLHAS);
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (status === 'PAGO') {
        list[index].dataPagamento = new Date().toISOString().split('T')[0];
      }
      setStored(STORAGE_KEYS.FOLHAS, list);
      return list[index];
    }
    throw new Error('Folha não encontrada');
  },

  getLancamentos(tipo?: 'ENTRADA' | 'SAIDA', status?: string, categoria?: string): LancamentoFinanceiro[] {
    let list = getStored<LancamentoFinanceiro[]>(STORAGE_KEYS.LANCAMENTOS, INITIAL_LANCAMENTOS);
    if (tipo) {
      list = list.filter(l => l.tipo === tipo);
    }
    if (status) {
      list = list.filter(l => l.status === status);
    }
    if (categoria) {
      list = list.filter(l => l.categoria.toLowerCase() === categoria.toLowerCase());
    }
    return list;
  },

  saveLancamento(data: Partial<LancamentoFinanceiro>): LancamentoFinanceiro {
    const list = getStored<LancamentoFinanceiro[]>(STORAGE_KEYS.LANCAMENTOS, INITIAL_LANCAMENTOS);
    if (data.id) {
      const idx = list.findIndex(l => l.id === data.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data } as LancamentoFinanceiro;
        setStored(STORAGE_KEYS.LANCAMENTOS, list);
        return list[idx];
      }
    }
    const newId = list.length > 0 ? Math.max(...list.map(l => l.id)) + 1 : 1;
    const newLanc: LancamentoFinanceiro = {
      id: newId,
      tipo: data.tipo || 'SAIDA',
      descricao: data.descricao || '',
      categoria: data.categoria || 'ADMINISTRATIVO',
      valor: data.valor || 0,
      dataVencimento: data.dataVencimento || new Date().toISOString().split('T')[0],
      dataPagamento: data.status === 'PAGO' ? (data.dataPagamento || new Date().toISOString().split('T')[0]) : undefined,
      formaPagamento: data.formaPagamento || 'PIX',
      status: data.status || 'PENDENTE',
      comprovanteUrl: data.comprovanteUrl,
      dataCriacao: new Date().toISOString().split('T')[0],
    };
    list.unshift(newLanc);
    setStored(STORAGE_KEYS.LANCAMENTOS, list);
    return newLanc;
  },

  deleteLancamento(id: number): void {
    const list = getStored<LancamentoFinanceiro[]>(STORAGE_KEYS.LANCAMENTOS, INITIAL_LANCAMENTOS);
    setStored(STORAGE_KEYS.LANCAMENTOS, list.filter(l => l.id !== id));
  },

  getMateriais(): Material[] {
    return getStored<Material[]>(STORAGE_KEYS.MATERIAIS, INITIAL_MATERIAIS);
  },

  saveMaterial(data: Partial<Material>): Material {
    const list = getStored<Material[]>(STORAGE_KEYS.MATERIAIS, INITIAL_MATERIAIS);
    if (data.id) {
      const idx = list.findIndex(m => m.id === data.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data } as Material;
        setStored(STORAGE_KEYS.MATERIAIS, list);
        return list[idx];
      }
    }
    const newId = list.length > 0 ? Math.max(...list.map(m => m.id)) + 1 : 1;
    const newMat: Material = {
      id: newId,
      nome: data.nome || '',
      categoria: data.categoria || 'Geral',
      quantidadeEstoque: data.quantidadeEstoque || 0,
      quantidadeMinima: data.quantidadeMinima || 5,
      localArmazenamento: data.localArmazenamento || 'Depósito',
    };
    list.push(newMat);
    setStored(STORAGE_KEYS.MATERIAIS, list);
    return newMat;
  },

  getUniformes(): Uniforme[] {
    return getStored<Uniforme[]>(STORAGE_KEYS.UNIFORMES, INITIAL_UNIFORMES);
  },

  entregarUniforme(uniformeId: number, quantidade: number): Uniforme {
    const list = getStored<Uniforme[]>(STORAGE_KEYS.UNIFORMES, INITIAL_UNIFORMES);
    const idx = list.findIndex(u => u.id === uniformeId);
    if (idx !== -1) {
      list[idx].quantidadeEntregue += quantidade;
      list[idx].saldoEstoque = Math.max(0, list[idx].quantidadeComprada - list[idx].quantidadeEntregue);
      setStored(STORAGE_KEYS.UNIFORMES, list);
      return list[idx];
    }
    throw new Error('Uniforme não encontrado');
  },

  getDashboardStats(): DashboardStats {
    const lancamentos = getStored<LancamentoFinanceiro[]>(STORAGE_KEYS.LANCAMENTOS, INITIAL_LANCAMENTOS);
    const alunos = getStored<Aluno[]>(STORAGE_KEYS.ALUNOS, INITIAL_ALUNOS);

    const totalReceitasPagas = lancamentos
      .filter(l => l.tipo === 'ENTRADA' && l.status === 'PAGO')
      .reduce((acc, curr) => acc + curr.valor, 0);

    const totalDespesasPagas = lancamentos
      .filter(l => l.tipo === 'SAIDA' && l.status === 'PAGO')
      .reduce((acc, curr) => acc + curr.valor, 0);

    const totalDespesasComprometidas = lancamentos
      .filter(l => l.tipo === 'SAIDA' && (l.status === 'PENDENTE' || l.status === 'PROGRAMADO'))
      .reduce((acc, curr) => acc + curr.valor, 0);

    // Saldo Disponível = Total Recebido (Pago) - Total Gasto (Pago)
    const saldoDisponivel = totalReceitasPagas - totalDespesasPagas;

    // Saldo Livre = Total Recebido - (Total Pago + Despesas Comprometidas/Programadas)
    const saldoLivre = totalReceitasPagas - (totalDespesasPagas + totalDespesasComprometidas);

    const totalAlunosAtivos = alunos.filter(a => a.status === 'ATIVO').length;

    // Frequência global média
    const sumFreq = alunos.reduce((acc, a) => acc + (a.taxaFrequencia || 85), 0);
    const taxaFrequenciaGlobal = alunos.length > 0 ? Math.round((sumFreq / alunos.length) * 10) / 10 : 88.5;

    // Despesas por Categoria
    const despesasMap: Record<string, number> = {};
    let totalDespesasSaida = 0;
    lancamentos
      .filter(l => l.tipo === 'SAIDA')
      .forEach(l => {
        despesasMap[l.categoria] = (despesasMap[l.categoria] || 0) + l.valor;
        totalDespesasSaida += l.valor;
      });

    const despesasPorCategoria: CategoriaDespesa[] = Object.keys(despesasMap).map(cat => ({
      categoria: cat,
      total: despesasMap[cat],
      percentual: totalDespesasSaida > 0 ? Math.round((despesasMap[cat] / totalDespesasSaida) * 1000) / 10 : 0,
    }));

    return {
      saldoDisponivel,
      saldoLivre,
      totalReceitasPagas,
      totalDespesasPagas,
      totalDespesasComprometidas,
      totalAlunosAtivos,
      taxaFrequenciaGlobal,
      despesasPorCategoria,
      execucaoOrcamentaria: INITIAL_ORCAMENTOS,
    };
  },

  getChamada(categoria: string, dataAula: string, turma?: string, horario?: string): { itens: ChamadaItem[]; dataRegistro: string } | null {
    const chamadas = getStored<Record<string, { itens: ChamadaItem[]; dataRegistro: string; turma?: string; horario?: string }>>(
      STORAGE_KEYS.CHAMADAS,
      INITIAL_CHAMADAS_HISTORICO
    );
    // 1. Tenta chave ultra-específica: data + categoria + turma + horario
    if (turma && horario) {
      const keyFull = `${dataAula}_${categoria}_${turma}_${horario}`;
      if (chamadas[keyFull]) return chamadas[keyFull];
    }
    // 2. Tenta chave com turma
    if (turma) {
      const keyTurma = `${dataAula}_${categoria}_${turma}`;
      if (chamadas[keyTurma]) return chamadas[keyTurma];
    }
    // 3. Tenta chave padrão: data + categoria
    const keyPadrao = `${dataAula}_${categoria}`;
    if (chamadas[keyPadrao]) return chamadas[keyPadrao];

    return null;
  },

  saveChamada(categoria: string, dataAula: string, itens: ChamadaItem[], turma?: string, horario?: string): void {
    const chamadas = getStored<Record<string, { itens: ChamadaItem[]; dataRegistro: string; turma?: string; horario?: string }>>(
      STORAGE_KEYS.CHAMADAS,
      INITIAL_CHAMADAS_HISTORICO
    );
    const registro = {
      itens,
      dataRegistro: new Date().toISOString(),
      turma,
      horario,
    };
    if (turma && horario) {
      chamadas[`${dataAula}_${categoria}_${turma}_${horario}`] = registro;
    }
    if (turma) {
      chamadas[`${dataAula}_${categoria}_${turma}`] = registro;
    }
    chamadas[`${dataAula}_${categoria}`] = registro;
    setStored(STORAGE_KEYS.CHAMADAS, chamadas);
  }
};
