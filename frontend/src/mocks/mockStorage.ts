import { Aluno, Colaborador, FolhaAula, FormaPagamento, LancamentoFinanceiro, Material, Uniforme, DashboardStats, CategoriaAluno, CategoriaDespesa, ChamadaItem, TetoConfig } from '../types';
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

    // Garante que campos novos (dataNascimento, chavePix) sejam sincronizados com colaboradores mockados existentes
    let updated = false;
    list = list.map((c) => {
      const initial = INITIAL_COLABORADORES.find((ic) => ic.id === c.id);
      let dataNascimento = c.dataNascimento || initial?.dataNascimento;
      let chavePix = c.chavePix || initial?.chavePix;
      if (dataNascimento !== c.dataNascimento || chavePix !== c.chavePix) {
        updated = true;
        return { ...c, dataNascimento, chavePix };
      }
      return c;
    });

    if (updated) {
      setStored(STORAGE_KEYS.COLABORADORES, list);
    }

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
      dataNascimento: data.dataNascimento,
      chavePix: data.chavePix,
    };
    list.push(newColab);
    setStored(STORAGE_KEYS.COLABORADORES, list);
    return newColab;
  },

  deleteColaborador(id: number): void {
    const list = getStored<Colaborador[]>(STORAGE_KEYS.COLABORADORES, INITIAL_COLABORADORES);
    setStored(STORAGE_KEYS.COLABORADORES, list.filter(c => c.id !== id));
  },

  getFolhas(mesReferencia?: string): FolhaAula[] {
    const targetMes = mesReferencia || '2026-10';
    let list = getStored<FolhaAula[]>(STORAGE_KEYS.FOLHAS, INITIAL_FOLHAS);
    const colabs = getStored<Colaborador[]>(STORAGE_KEYS.COLABORADORES, INITIAL_COLABORADORES);

    let changed = false;

    // 1. Sincroniza e garante que todo colaborador cadastrado tenha apuração na Folha
    colabs.forEach((colab) => {
      const existingIndex = list.findIndex(
        (f) => f.colaboradorId === colab.id && f.mesReferencia === targetMes
      );

      if (existingIndex !== -1) {
        // Atualiza dados sincronizados do colaborador (nome, cargo, foto, vínculo)
        const current = list[existingIndex];
        const isHorista = colab.tipoContratacao === 'HORISTA';
        const updatedName = current.colaboradorNome !== colab.nome;
        const updatedFuncao = current.colaboradorFuncao !== colab.funcao;
        const updatedFoto = current.colaboradorFotoUrl !== colab.fotoUrl;
        const updatedTipo = current.tipoContratacao !== colab.tipoContratacao;

        if (updatedName || updatedFuncao || updatedFoto || updatedTipo) {
          list[existingIndex] = {
            ...current,
            colaboradorNome: colab.nome,
            colaboradorFuncao: colab.funcao,
            colaboradorFotoUrl: colab.fotoUrl,
            tipoContratacao: colab.tipoContratacao,
            valorHora: isHorista ? (colab.valorHora || current.valorHora) : current.valorHora,
          };
          changed = true;
        }
      } else {
        // Novo colaborador criado em Corpo Docente: adiciona na folha de apuração
        const nextId = list.length > 0 ? Math.max(...list.map((f) => f.id)) + 1 : 1;
        const isHorista = colab.tipoContratacao === 'HORISTA';
        const horasRegistradas = isHorista ? 40 : 160;
        const valorHora = isHorista
          ? (colab.valorHora || 50.0)
          : (colab.salarioFixo ? Number((colab.salarioFixo / 160).toFixed(2)) : 28.12);
        const totalBruto = isHorista ? horasRegistradas * valorHora : (colab.salarioFixo || 4500.0);
        const diasTransporte = isHorista ? 16 : 20;
        const valorDiarioTransporte = 11.0;
        const passagem = diasTransporte * valorDiarioTransporte;
        const outrosBeneficios = Math.max(0, (colab.beneficios || 0) - passagem);
        const beneficios = passagem + outrosBeneficios;
        const descontos = 0;
        const liquidoPagar = totalBruto + beneficios - descontos;

        list.push({
          id: nextId,
          colaboradorId: colab.id,
          colaboradorNome: colab.nome,
          colaboradorFuncao: colab.funcao,
          colaboradorFotoUrl: colab.fotoUrl,
          tipoContratacao: colab.tipoContratacao,
          mesReferencia: targetMes,
          horasRegistradas,
          valorHora,
          totalBruto,
          diasTransporte,
          valorDiarioTransporte,
          passagem,
          outrosBeneficios,
          beneficios,
          descontos,
          liquidoPagar,
          status: 'PENDENTE',
        });
        changed = true;
      }
    });

    // 2. Remove da apuração colaboradores que foram excluídos
    const activeColabIds = new Set(colabs.map((c) => c.id));
    const previousLength = list.length;
    list = list.filter((f) => activeColabIds.has(f.colaboradorId));
    if (list.length !== previousLength) {
      changed = true;
    }

    if (changed) {
      setStored(STORAGE_KEYS.FOLHAS, list);
    }

    if (mesReferencia) {
      return list.filter((f) => f.mesReferencia === mesReferencia);
    }
    return list;
  },

  saveFolha(data: Partial<FolhaAula>): FolhaAula {
    let list = getStored<FolhaAula[]>(STORAGE_KEYS.FOLHAS, INITIAL_FOLHAS);
    const index = list.findIndex(
      (f) => f.id === data.id || (data.colaboradorId && f.colaboradorId === data.colaboradorId && f.mesReferencia === data.mesReferencia)
    );

    if (index !== -1) {
      const current = list[index];
      const horasRegistradas = data.horasRegistradas !== undefined ? Number(data.horasRegistradas) : current.horasRegistradas;
      const valorHora = data.valorHora !== undefined ? Number(data.valorHora) : current.valorHora;
      const totalBruto = data.totalBruto !== undefined ? Number(data.totalBruto) : (
        current.tipoContratacao === 'HORISTA' ? horasRegistradas * valorHora : current.totalBruto
      );
      const diasTransporte = data.diasTransporte !== undefined ? Number(data.diasTransporte) : (current.diasTransporte || 0);
      const valorDiarioTransporte = data.valorDiarioTransporte !== undefined ? Number(data.valorDiarioTransporte) : (current.valorDiarioTransporte || 11.0);
      const passagem = data.passagem !== undefined ? Number(data.passagem) : (diasTransporte * valorDiarioTransporte);
      const outrosBeneficios = data.outrosBeneficios !== undefined ? Number(data.outrosBeneficios) : (current.outrosBeneficios || 0);
      const beneficios = data.beneficios !== undefined ? Number(data.beneficios) : (passagem + outrosBeneficios);
      const descontos = data.descontos !== undefined ? Number(data.descontos) : current.descontos;
      const liquidoPagar = totalBruto + beneficios - descontos;

      const updatedFolha: FolhaAula = {
        ...current,
        ...data,
        horasRegistradas,
        valorHora,
        totalBruto,
        diasTransporte,
        valorDiarioTransporte,
        passagem,
        outrosBeneficios,
        beneficios,
        descontos,
        liquidoPagar,
      };

      list[index] = updatedFolha;
      setStored(STORAGE_KEYS.FOLHAS, list);
      return updatedFolha;
    }

    const nextId = list.length > 0 ? Math.max(...list.map((f) => f.id)) + 1 : 1;
    const newFolha: FolhaAula = {
      id: nextId,
      colaboradorId: data.colaboradorId || 1,
      colaboradorNome: data.colaboradorNome || 'Colaborador',
      colaboradorFuncao: data.colaboradorFuncao || 'Instrutor',
      colaboradorFotoUrl: data.colaboradorFotoUrl,
      tipoContratacao: data.tipoContratacao || 'HORISTA',
      mesReferencia: data.mesReferencia || '2026-10',
      horasRegistradas: data.horasRegistradas || 0,
      valorHora: data.valorHora || 50,
      totalBruto: data.totalBruto || 0,
      beneficios: data.beneficios || 0,
      passagem: data.passagem || 0,
      diasTransporte: data.diasTransporte || 0,
      valorDiarioTransporte: data.valorDiarioTransporte || 11,
      outrosBeneficios: data.outrosBeneficios || 0,
      descontos: data.descontos || 0,
      liquidoPagar: data.liquidoPagar || 0,
      status: data.status || 'PENDENTE',
    };
    list.push(newFolha);
    setStored(STORAGE_KEYS.FOLHAS, list);
    return newFolha;
  },

  updateFolhaStatus(
    id: number,
    status: 'PAGO' | 'PENDENTE',
    dadosPagamento?: {
      dataPagamento?: string;
      formaPagamento?: FormaPagamento;
      comprovanteUrl?: string;
      comprovanteNome?: string;
      comprovanteTipo?: 'FOTO' | 'ARQUIVO' | 'URL';
      lancamentoFinanceiroId?: number;
    }
  ): FolhaAula {
    const list = getStored<FolhaAula[]>(STORAGE_KEYS.FOLHAS, INITIAL_FOLHAS);
    const index = list.findIndex(f => f.id === id);
    if (index !== -1) {
      list[index].status = status;
      if (status === 'PAGO') {
        list[index].dataPagamento = dadosPagamento?.dataPagamento || new Date().toISOString().split('T')[0];
        if (dadosPagamento?.formaPagamento) list[index].formaPagamento = dadosPagamento.formaPagamento;
        if (dadosPagamento?.comprovanteUrl) list[index].comprovanteUrl = dadosPagamento.comprovanteUrl;
        if (dadosPagamento?.comprovanteNome) list[index].comprovanteNome = dadosPagamento.comprovanteNome;
        if (dadosPagamento?.comprovanteTipo) list[index].comprovanteTipo = dadosPagamento.comprovanteTipo;
        if (dadosPagamento?.lancamentoFinanceiroId) list[index].lancamentoFinanceiroId = dadosPagamento.lancamentoFinanceiroId;
      } else {
        list[index].dataPagamento = undefined;
        list[index].comprovanteUrl = undefined;
        list[index].comprovanteNome = undefined;
        list[index].comprovanteTipo = undefined;
        list[index].lancamentoFinanceiroId = undefined;
      }
      setStored(STORAGE_KEYS.FOLHAS, list);
      return list[index];
    }
    throw new Error('Folha não encontrada');
  },

  getTetoOrcamentario(): TetoConfig {
    const DEFAULT_TETO: TetoConfig = {
      total: 90000.0,
      anual: 180000.0,
      mensal: 15000.0,
      diario: 750.0,
      duracaoMeses: 6,
    };
    try {
      const stored = localStorage.getItem('portofc_teto_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          const mensal = Number(parsed.mensal) || 15000.0;
          const duracaoMeses = Number(parsed.duracaoMeses) || 6;
          return {
            total: Number(parsed.total) || mensal * duracaoMeses,
            anual: Number(parsed.anual) || Number(parsed.semestral ? parsed.semestral * 2 : mensal * 12),
            mensal,
            diario: Number(parsed.diario) || Number((mensal / 20).toFixed(2)),
            duracaoMeses,
          };
        }
      }
      // Fallback retrocompatibilidade com versão anterior
      const oldStored = localStorage.getItem('portofc_teto_salarios');
      if (oldStored) {
        const val = parseFloat(oldStored);
        if (!isNaN(val) && val > 0) {
          return {
            total: val * 12,
            anual: val * 12,
            mensal: val,
            diario: Number((val / 20).toFixed(2)),
          };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_TETO;
  },

  setTetoOrcamentario(teto: TetoConfig): TetoConfig {
    try {
      localStorage.setItem('portofc_teto_config', JSON.stringify(teto));
      localStorage.setItem('portofc_teto_salarios', String(teto.mensal));
    } catch (e) {
      console.error('Erro ao salvar teto orçamentário', e);
    }
    return teto;
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
      comprovanteNome: data.comprovanteNome,
      comprovanteTipo: data.comprovanteTipo,
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
