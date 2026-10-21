import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  FileText,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Upload,
  Image,
  Paperclip,
  Link,
  ExternalLink,
  X,
  Check,
  BarChart3,
  TrendingUp,
  Sliders,
  PieChart,
  Landmark,
  Package,
  Trophy,
  Users,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { EmptyState } from '../../ui/EmptyState';
import { financeiroService } from '../../../services/financeiroService';
import {
  FormaPagamento,
  LancamentoFinanceiro,
  OrcamentoMes,
  StatusFinanceiro,
  TipoLancamento,
} from '../../../types';

export interface RubricaOrcamentaria {
  id: string;
  nome: string;
  periodoLabel: string;
  previsto: number;
  comprometido: number;
  realizado: number;
}

const DEFAULT_RUBRICAS: RubricaOrcamentaria[] = [
  { id: 'SALARIOS', nome: 'Salários / Colaboradores', periodoLabel: 'Jan a Jun (R$ 10k/mês)', previsto: 60000, comprometido: 10000, realizado: 30000 },
  { id: 'UNIFORMES', nome: 'Uniformes e Kits', periodoLabel: 'Jan a Jun', previsto: 20000, comprometido: 0, realizado: 16500 },
  { id: 'MATERIAIS', nome: 'Materiais Esportivos', periodoLabel: 'Jan a Jun', previsto: 12000, comprometido: 0, realizado: 5500 },
  { id: 'TORNEIOS', nome: 'Torneios e Campeonatos', periodoLabel: 'Jan a Jun', previsto: 10000, comprometido: 2500, realizado: 3500 },
  { id: 'EVENTOS', nome: 'Eventos Sociais', periodoLabel: 'Jan a Jun', previsto: 7000, comprometido: 0, realizado: 1800 },
  { id: 'ADMINISTRATIVO', nome: 'Gestão Administrativa', periodoLabel: 'Jan a Jun', previsto: 6000, comprometido: 0, realizado: 1000 },
  { id: 'OUTROS', nome: 'Outros e Contingência', periodoLabel: 'Jan a Jun', previsto: 5000, comprometido: 0, realizado: 0 },
];

interface LancamentoFormData {
  tipo: TipoLancamento;
  descricao: string;
  categoria: string;
  valor: string;
  dataVencimento: string;
  dataPagamento: string;
  formaPagamento: FormaPagamento;
  status: StatusFinanceiro;
  comprovanteUrl: string;
  comprovanteNome: string;
  comprovanteTipo: 'FOTO' | 'ARQUIVO' | 'URL';
}

const initialFormState: LancamentoFormData = {
  tipo: 'SAIDA',
  descricao: '',
  categoria: 'MATERIAIS',
  valor: '',
  dataVencimento: new Date().toISOString().split('T')[0],
  dataPagamento: '',
  formaPagamento: 'PIX',
  status: 'PAGO',
  comprovanteUrl: '',
  comprovanteNome: '',
  comprovanteTipo: 'ARQUIVO',
};

export const FinanceiroModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matriz' | 'extrato'>('matriz');
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoMes[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros da Matriz Orçamentária Governamental
  const [periodoMatriz, setPeriodoMatriz] = useState<'SEMESTRAL' | 'TRIMESTRAL' | 'MENSAL' | 'ANUAL'>('SEMESTRAL');
  const [subPeriodoSemestre, setSubPeriodoSemestre] = useState<'JAN_JUN' | 'JUL_DEZ'>('JAN_JUN');
  const [subPeriodoTrimestre, setSubPeriodoTrimestre] = useState<'T1' | 'T2' | 'T3' | 'T4'>('T1');
  const [subPeriodoMes, setSubPeriodoMes] = useState<string>('2026-10');
  const [filtroRubrica, setFiltroRubrica] = useState<string>('TODAS');

  // Rubricas Orçamentárias
  const [rubricas, setRubricas] = useState<RubricaOrcamentaria[]>(() => {
    try {
      const saved = localStorage.getItem('portofc_matriz_rubricas');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao carregar rubricas', e);
    }
    return DEFAULT_RUBRICAS;
  });

  // Modal para Ajustar Teto / Orçamento Previsto por Categoria
  const [isAjustarTetoModalOpen, setIsAjustarTetoModalOpen] = useState(false);
  const [tetoFormData, setTetoFormData] = useState<Record<string, string>>({
    SALARIOS: '60000',
    UNIFORMES: '20000',
    MATERIAIS: '12000',
    TORNEIOS: '10000',
    EVENTOS: '7000',
    ADMINISTRATIVO: '6000',
    OUTROS: '5000',
  });

  // Filtros antigos de orçamentos mensais (mantidos para compatibilidade)
  const [filtroOrcamento, setFiltroOrcamento] = useState<'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'>('TRIMESTRAL');
  const [selectedTrimestre, setSelectedTrimestre] = useState<'T1' | 'T2' | 'T3' | 'T4'>('T1');
  const [selectedSemestre, setSelectedSemestre] = useState<'S1' | 'S2'>('S1');
  const [selectedMesOrcamento, setSelectedMesOrcamento] = useState<string>('TODOS');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrcamentoModalOpen, setIsOrcamentoModalOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<LancamentoFinanceiro | null>(null);
  const [form, setForm] = useState<LancamentoFormData>(initialFormState);

  // Referência para os botões do cabeçalho e estado de visibilidade da barra fixa no topo
  const topActionsRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    let isVisible = false;

    const handleScroll = () => {
      if (topActionsRef.current) {
        const rect = topActionsRef.current.getBoundingClientRect();
        // Histerese para transição suave sem tremulação:
        // Ativa suavemente quando os botões passarem do topo (rect.bottom <= 20)
        // Desativa suavemente quando voltarem bem visíveis (rect.bottom > 70)
        if (!isVisible && rect.bottom <= 20) {
          isVisible = true;
          setShowStickyBar(true);
        } else if (isVisible && rect.bottom > 70) {
          isVisible = false;
          setShowStickyBar(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lancs, orcs] = await Promise.all([
        financeiroService.listarLancamentos(),
        financeiroService.obterOrcamento(),
      ]);
      setLancamentos(lancs);
      setOrcamentos(orcs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLancamentos = useMemo(() => {
    return lancamentos.filter((l) => {
      const matchTipo = filtroTipo === 'TODOS' || l.tipo === filtroTipo;
      const matchStatus = filtroStatus === 'TODOS' || l.status === filtroStatus;
      const matchSearch =
        searchTerm === '' ||
        l.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTipo && matchStatus && matchSearch;
    });
  }, [lancamentos, filtroTipo, filtroStatus, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingLancamento(null);
    setForm({
      ...initialFormState,
      dataVencimento: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: LancamentoFinanceiro) => {
    setEditingLancamento(item);
    setForm({
      tipo: item.tipo,
      descricao: item.descricao,
      categoria: item.categoria,
      valor: item.valor !== undefined && item.valor !== null ? String(item.valor) : '',
      dataVencimento: item.dataVencimento || new Date().toISOString().split('T')[0],
      dataPagamento: item.dataPagamento || '',
      formaPagamento: item.formaPagamento || 'PIX',
      status: item.status,
      comprovanteUrl: item.comprovanteUrl || '',
      comprovanteNome: item.comprovanteNome || (item.comprovanteUrl ? 'Comprovante Anexado' : ''),
      comprovanteTipo:
        item.comprovanteTipo ||
        (item.comprovanteUrl?.startsWith('data:image')
          ? 'FOTO'
          : item.comprovanteUrl?.startsWith('http')
          ? 'URL'
          : 'ARQUIVO'),
    });
    setIsModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A foto deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({
          ...prev,
          comprovanteUrl: reader.result as string,
          comprovanteNome: file.name,
          comprovanteTipo: 'FOTO',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({
          ...prev,
          comprovanteUrl: reader.result as string,
          comprovanteNome: file.name,
          comprovanteTipo: file.type.startsWith('image/') ? 'FOTO' : 'ARQUIVO',
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(form.valor.replace(',', '.')) || 0;
    if (!form.descricao.trim() || valorNum <= 0) {
      alert('Descrição e um valor válido (maior que zero) são obrigatórios.');
      return;
    }

    await financeiroService.salvarLancamento({
      ...(editingLancamento ? { id: editingLancamento.id } : {}),
      tipo: form.tipo,
      descricao: form.descricao.trim(),
      categoria: form.categoria,
      valor: valorNum,
      dataVencimento: form.dataVencimento,
      dataPagamento: form.status === 'PAGO' ? form.dataPagamento || form.dataVencimento : undefined,
      formaPagamento: form.formaPagamento,
      status: form.status,
      comprovanteUrl: form.comprovanteUrl.trim() || undefined,
      comprovanteNome: form.comprovanteNome.trim() || undefined,
      comprovanteTipo: form.comprovanteTipo,
    });

    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteLancamento = async (id: number) => {
    if (confirm('Deseja excluir este lançamento financeiro? Esta ação removerá o registro do livro-caixa.')) {
      await financeiroService.deletarLancamento(id);
      loadData();
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Totais Rápidos
  const totalReceitas = lancamentos
    .filter((l) => l.tipo === 'ENTRADA')
    .reduce((acc, l) => acc + l.valor, 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === 'SAIDA')
    .reduce((acc, l) => acc + l.valor, 0);

  const saldoReal = totalReceitas - totalDespesas;

  const formatMesNome = (mesAno: string) => {
    const parts = mesAno.split('-');
    if (parts.length < 2) return mesAno;
    const nomes = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const idx = parseInt(parts[1], 10) - 1;
    return `${nomes[idx] || parts[1]}/${parts[0]}`;
  };

  // Cálculos do Acompanhamento Orçamentário conforme o filtro de período
  const dadosOrcamentoExibicao = useMemo(() => {
    let itens: OrcamentoMes[] = [];
    let titulo = 'Acompanhamento Orçamentário';
    let descricao = 'Confronto entre o orçamento previsto e executado do projeto.';

    if (filtroOrcamento === 'MENSAL') {
      titulo = 'Acompanhamento Orçamentário - Mensal';
      descricao = 'Confronto individual mês a mês entre o orçamento previsto e executado.';
      if (selectedMesOrcamento === 'TODOS') {
        itens = orcamentos;
      } else {
        const itemMes = orcamentos.find((o) => o.mesReferencia === selectedMesOrcamento);
        itens = itemMes ? [itemMes] : orcamentos.slice(0, 3);
      }
    } else if (filtroOrcamento === 'TRIMESTRAL') {
      const trimestresMap: Record<string, { label: string; meses: string[] }> = {
        T1: { label: '1º Trimestre (Ago - Out/2026)', meses: ['2026-08', '2026-09', '2026-10'] },
        T2: { label: '2º Trimestre (Nov/2026 - Jan/2027)', meses: ['2026-11', '2026-12', '2027-01'] },
        T3: { label: '3º Trimestre (Fev - Abr/2027)', meses: ['2027-02', '2027-03', '2027-04'] },
        T4: { label: '4º Trimestre (Mai - Jul/2027)', meses: ['2027-05', '2027-06', '2027-07'] },
      };
      const infoT = trimestresMap[selectedTrimestre] || trimestresMap['T1'];
      titulo = `Acompanhamento Orçamentário - ${infoT.label}`;
      descricao = `Confronto dos 3 meses do ${infoT.label} com metas e execução consolidada.`;
      itens = orcamentos.filter((o) => infoT.meses.includes(o.mesReferencia));
    } else if (filtroOrcamento === 'SEMESTRAL') {
      const semestresMap: Record<string, { label: string; meses: string[] }> = {
        S1: { label: '1º Semestre (Ago/2026 a Jan/2027)', meses: ['2026-08', '2026-09', '2026-10', '2026-11', '2026-12', '2027-01'] },
        S2: { label: '2º Semestre (Fev/2027 a Jul/2027)', meses: ['2027-02', '2027-03', '2027-04', '2027-05', '2027-06', '2027-07'] },
      };
      const infoS = semestresMap[selectedSemestre] || semestresMap['S1'];
      titulo = `Acompanhamento Orçamentário - ${infoS.label}`;
      descricao = `Confronto dos 6 meses do ${infoS.label} com metas e execução consolidada.`;
      itens = orcamentos.filter((o) => infoS.meses.includes(o.mesReferencia));
    } else {
      // ANUAL
      titulo = 'Acompanhamento Orçamentário - Anual (12 Meses)';
      descricao = 'Confronto anual consolidado de todo o projeto da ONG PORTO FC.';
      itens = orcamentos;
    }

    const totalPrevisto = itens.reduce((acc, o) => acc + o.previsto, 0);
    const totalRealizado = itens.reduce((acc, o) => acc + o.realizado, 0);
    const totalDiferenca = totalPrevisto - totalRealizado;
    const pctGeral = totalPrevisto > 0 ? Math.round((totalRealizado / totalPrevisto) * 100) : 0;

    return {
      itens,
      titulo,
      descricao,
      totalPrevisto,
      totalRealizado,
      totalDiferenca,
      pctGeral,
    };
  }, [orcamentos, filtroOrcamento, selectedTrimestre, selectedSemestre, selectedMesOrcamento]);

  // Agrupamento dos 4 trimestres para a visão Anual
  const trimestresConsolidados = useMemo(() => {
    const tMap = [
      { id: 'T1', label: '1º Trimestre (Ago - Out/26)', meses: ['2026-08', '2026-09', '2026-10'] },
      { id: 'T2', label: '2º Trimestre (Nov/26 - Jan/27)', meses: ['2026-11', '2026-12', '2027-01'] },
      { id: 'T3', label: '3º Trimestre (Fev - Abr/27)', meses: ['2027-02', '2027-03', '2027-04'] },
      { id: 'T4', label: '4º Trimestre (Mai - Jul/27)', meses: ['2027-05', '2027-06', '2027-07'] },
    ];
    return tMap.map((t) => {
      const itens = orcamentos.filter((o) => t.meses.includes(o.mesReferencia));
      const previsto = itens.reduce((acc, o) => acc + o.previsto, 0);
      const realizado = itens.reduce((acc, o) => acc + o.realizado, 0);
      const diferenca = previsto - realizado;
      const pct = previsto > 0 ? Math.round((realizado / previsto) * 100) : 0;
      return {
        id: t.id,
        label: t.label,
        meses: t.meses,
        previsto,
        realizado,
        diferenca,
        pct,
      };
    });
  }, [orcamentos]);

  // Título e períodos dinâmicos da Matriz Orçamentária Governamental
  const tituloMatriz = useMemo(() => {
    if (periodoMatriz === 'SEMESTRAL') {
      return subPeriodoSemestre === 'JAN_JUN'
        ? 'MATRIZ ORÇAMENTÁRIA & PRESTAÇÃO DE CONTAS GOVERNAMENTAL (JANEIRO A JUNHO)'
        : 'MATRIZ ORÇAMENTÁRIA & PRESTAÇÃO DE CONTAS GOVERNAMENTAL (JULHO A DEZEMBRO)';
    } else if (periodoMatriz === 'TRIMESTRAL') {
      const mapT: Record<string, string> = {
        T1: '1º TRIMESTRE (JANEIRO A MARÇO)',
        T2: '2º TRIMESTRE (ABRIL A JUNHO)',
        T3: '3º TRIMESTRE (JULHO A SETEMBRO)',
        T4: '4º TRIMESTRE (OUTUBRO A DEZEMBRO)',
      };
      return `MATRIZ ORÇAMENTÁRIA & PRESTAÇÃO DE CONTAS GOVERNAMENTAL (${mapT[subPeriodoTrimestre] || 'TRIMESTRAL'})`;
    } else if (periodoMatriz === 'MENSAL') {
      const nomesMes: Record<string, string> = {
        '2026-08': 'AGOSTO DE 2026',
        '2026-09': 'SETEMBRO DE 2026',
        '2026-10': 'OUTUBRO DE 2026',
        '2026-11': 'NOVEMBRO DE 2026',
        '2026-12': 'DEZEMBRO DE 2026',
      };
      return `MATRIZ ORÇAMENTÁRIA & PRESTAÇÃO DE CONTAS GOVERNAMENTAL (${nomesMes[subPeriodoMes] || 'MENSAL'})`;
    } else {
      return 'MATRIZ ORÇAMENTÁRIA & PRESTAÇÃO DE CONTAS GOVERNAMENTAL (EXERCÍCIO ANUAL COMPLETO)';
    }
  }, [periodoMatriz, subPeriodoSemestre, subPeriodoTrimestre, subPeriodoMes]);

  const periodoSubtituloLinha = useMemo(() => {
    if (periodoMatriz === 'SEMESTRAL') {
      return subPeriodoSemestre === 'JAN_JUN' ? 'Jan a Jun' : 'Jul a Dez';
    } else if (periodoMatriz === 'TRIMESTRAL') {
      const mapT: Record<string, string> = {
        T1: 'Jan a Mar',
        T2: 'Abr a Jun',
        T3: 'Jul a Set',
        T4: 'Out a Dez',
      };
      return mapT[subPeriodoTrimestre] || 'Trimestral';
    } else if (periodoMatriz === 'MENSAL') {
      return formatMesNome(subPeriodoMes);
    } else {
      return 'Consolidado Anual';
    }
  }, [periodoMatriz, subPeriodoSemestre, subPeriodoTrimestre, subPeriodoMes]);

  const periodoTotalLinha = useMemo(() => {
    if (periodoMatriz === 'SEMESTRAL') return 'Consolidado Semestral';
    if (periodoMatriz === 'TRIMESTRAL') return 'Consolidado Trimestral';
    if (periodoMatriz === 'MENSAL') return 'Consolidado Mensal';
    return 'Consolidado Anual';
  }, [periodoMatriz]);

  // Cálculos consolidados da Matriz com filtro por categoria/rubrica
  const rubricasCalculadas = useMemo(() => {
    let list = rubricas;
    if (filtroRubrica !== 'TODAS') {
      list = list.filter((r) => r.id === filtroRubrica);
    }
    return list.map((r) => {
      const label =
        r.id === 'SALARIOS' && periodoMatriz === 'SEMESTRAL' && subPeriodoSemestre === 'JAN_JUN'
          ? 'Jan a Jun (R$ 10k/mês)'
          : periodoSubtituloLinha;
      const saldoRestante = r.previsto - r.comprometido - r.realizado;
      const pctExecucao = r.previsto > 0 ? (r.realizado / r.previsto) * 100 : 0;
      return {
        ...r,
        periodoLabelDinamico: label,
        saldoRestante,
        pctExecucao,
      };
    });
  }, [rubricas, filtroRubrica, periodoMatriz, subPeriodoSemestre, periodoSubtituloLinha]);

  const totaisMatriz = useMemo(() => {
    const previsto = rubricasCalculadas.reduce((acc, r) => acc + r.previsto, 0);
    const comprometido = rubricasCalculadas.reduce((acc, r) => acc + r.comprometido, 0);
    const realizado = rubricasCalculadas.reduce((acc, r) => acc + r.realizado, 0);
    const saldoRestante = previsto - comprometido - realizado;
    const pctExecucao = previsto > 0 ? (realizado / previsto) * 100 : 0;
    return {
      previsto,
      comprometido,
      realizado,
      saldoRestante,
      pctExecucao,
    };
  }, [rubricasCalculadas]);

  const handleOpenAjustarTeto = () => {
    const data: Record<string, string> = {};
    rubricas.forEach((r) => {
      data[r.id] = String(r.previsto);
    });
    setTetoFormData(data);
    setIsAjustarTetoModalOpen(true);
  };

  const handleSaveTetos = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = rubricas.map((r) => {
      const val = parseFloat(tetoFormData[r.id]?.replace(',', '.') || '0') || 0;
      return {
        ...r,
        previsto: val,
      };
    });
    setRubricas(updated);
    try {
      localStorage.setItem('portofc_matriz_rubricas', JSON.stringify(updated));
    } catch (err) {
      console.warn('Erro ao salvar rubricas', err);
    }
    setIsAjustarTetoModalOpen(false);
  };

  // Renderizador Moderno da Tabela Matriz Orçamentária Governamental
  const renderMatrizTabela = () => {
    const getRubricaIcon = (id: string) => {
      switch (id) {
        case 'SALARIOS':
          return <Users size={15} className="text-blue-600" />;
        case 'UNIFORMES':
          return <Package size={15} className="text-indigo-600" />;
        case 'MATERIAIS':
          return <Package size={15} className="text-emerald-600" />;
        case 'TORNEIOS':
          return <Trophy size={15} className="text-amber-600" />;
        case 'EVENTOS':
          return <Calendar size={15} className="text-purple-600" />;
        case 'ADMINISTRATIVO':
          return <FileText size={15} className="text-slate-600" />;
        default:
          return <DollarSign size={15} className="text-slate-500" />;
      }
    };

    return (
      <Card noPadding className="border border-slate-200/80 shadow-xs overflow-hidden rounded-2xl bg-white">
        {/* Cabeçalho Elegante e Moderno da Tabela */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center font-bold shadow-2xs border border-blue-200/60 shrink-0">
              <Landmark size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Matriz Orçamentária & Prestação de Contas Governamental
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                  {subPeriodoSemestre === 'JAN_JUN' && periodoMatriz === 'SEMESTRAL' ? 'Janeiro a Junho' : periodoTotalLinha}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Demonstrativo de execução por rubricas orçamentárias pactuadas da emenda parlamentar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs">
              {rubricasCalculadas.length} {rubricasCalculadas.length === 1 ? 'rubrica exibida' : 'rubricas orçamentárias'}
            </span>
          </div>
        </div>

        {/* Tabela com scroll horizontal responsivo e visual moderno */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-600 border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5 text-left font-semibold border-b border-slate-200/80 whitespace-nowrap">
                  Categoria / Rubrica Orçamentária
                </th>
                <th className="py-3.5 px-4 text-center font-semibold border-b border-slate-200/80 whitespace-nowrap">
                  Período / Meses
                </th>
                <th className="py-3.5 px-4 text-right font-semibold border-b border-slate-200/80 whitespace-nowrap">
                  Orçamento Previsto (R$)
                </th>
                <th className="py-3.5 px-4 text-right font-semibold border-b border-slate-200/80 whitespace-nowrap">
                  Comprometido (R$)
                </th>
                <th className="py-3.5 px-4 text-right font-semibold border-b border-slate-200/80 whitespace-nowrap">
                  Realizado Pago (R$)
                </th>
                <th className="py-3.5 px-4 text-right font-semibold border-b border-slate-200/80 whitespace-nowrap">
                  Saldo Restante (R$)
                </th>
                <th className="py-3.5 px-5 text-right font-semibold border-b border-slate-200/80 whitespace-nowrap w-44">
                  % Execução
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rubricasCalculadas.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 text-left border-b border-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/60">
                        {getRubricaIcon(r.id)}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">{r.nome}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center border-b border-slate-100 whitespace-nowrap">
                    <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-lg">
                      {r.periodoLabelDinamico}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-semibold text-slate-800 border-b border-slate-100 whitespace-nowrap">
                    {formatBRL(r.previsto)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium text-amber-700 border-b border-slate-100 whitespace-nowrap">
                    {r.comprometido > 0 ? formatBRL(r.comprometido) : <span className="text-slate-400">R$ 0,00</span>}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-blue-700 border-b border-slate-100 whitespace-nowrap">
                    {r.realizado > 0 ? formatBRL(r.realizado) : <span className="text-slate-400">R$ 0,00</span>}
                  </td>

                  <td className="py-3.5 px-4 text-right border-b border-slate-100 whitespace-nowrap">
                    <span className="inline-block px-2.5 py-1 rounded-lg font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 text-xs shadow-2xs">
                      {formatBRL(r.saldoRestante)}
                    </span>
                  </td>

                  <td className="py-3.5 px-5 text-right border-b border-slate-100 whitespace-nowrap">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            r.pctExecucao > 100 ? 'bg-rose-500' : r.pctExecucao > 80 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, r.pctExecucao)}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-slate-700 w-12 text-right">
                        {r.pctExecucao.toFixed(1).replace('.', ',')}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50/90 font-bold text-slate-900 border-t-2 border-slate-200 text-xs sm:text-sm">
                <td className="py-4 px-5 text-left uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>TOTAL GERAL DA EMENDA</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-xs text-slate-600 font-semibold">
                  <span className="bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                    {periodoTotalLinha}
                  </span>
                </td>
                <td className="py-4 px-4 text-right text-slate-900 font-bold">
                  {formatBRL(totaisMatriz.previsto)}
                </td>
                <td className="py-4 px-4 text-right text-amber-700 font-bold">
                  {formatBRL(totaisMatriz.comprometido)}
                </td>
                <td className="py-4 px-4 text-right text-blue-700 font-bold">
                  {formatBRL(totaisMatriz.realizado)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="inline-block px-3 py-1 rounded-lg font-black text-emerald-900 bg-emerald-100/80 border border-emerald-300/80 text-xs sm:text-sm shadow-2xs">
                    {formatBRL(totaisMatriz.saldoRestante)}
                  </span>
                </td>
                <td className="py-4 px-5 text-right font-black text-slate-900 text-xs sm:text-sm">
                  {totaisMatriz.pctExecucao.toFixed(1).replace('.', ',')}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Bloco Fixo no Topo ao rolar a página */}
      <div
        className={`fixed top-4 right-6 lg:right-10 z-50 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-2.5 ring-1 ring-black/5 transition-all duration-300 ease-out transform ${
          showStickyBar
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOrcamentoModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="Abrir Acompanhamento Orçamentário"
        >
          <BarChart3 size={17} className="text-blue-600" />
          Acompanhamento Orçamentário
        </button>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
          title="Novo Lançamento Financeiro"
        >
          <Plus size={17} />
          Novo Lançamento
        </button>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financeiro</h2>
          <p className="text-sm text-slate-500 mt-1">
            Lançamento de receitas e despesas, controle orçamentário e comprovantes.
          </p>
        </div>
        <div ref={topActionsRef} className="flex items-center gap-2.5">
          <Button
            variant="outline"
            icon={<BarChart3 size={18} />}
            onClick={() => setIsOrcamentoModalOpen(true)}
          >
            Acompanhamento Orçamentário
          </Button>
          <Button variant="emerald" icon={<Plus size={18} />} onClick={handleOpenCreateModal}>
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Navegação por Abas: Matriz Orçamentária Governamental & Extrato Livro-Caixa */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('matriz')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'matriz'
              ? 'bg-blue-700 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 size={16} />
          Matriz Orçamentária Governamental
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('extrato')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'extrato'
              ? 'bg-blue-700 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText size={16} />
          Extrato & Livro-Caixa ({lancamentos.length})
        </button>
      </div>

      {activeTab === 'matriz' ? (
        <div className="space-y-6">
          {/* KPI Cards da Matriz Orçamentária */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-200/80 hover:border-blue-200 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Orçamento Previsto (Emenda)
                </span>
                <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <Landmark size={14} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-2.5">{formatBRL(totaisMatriz.previsto)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Teto global pactuado da emenda</p>
            </Card>

            <Card className="p-4 border-slate-200/80 hover:border-amber-200 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Comprometido
                </span>
                <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
                  <Clock size={14} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-amber-700 mt-2.5">{formatBRL(totaisMatriz.comprometido)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Contratos e despesas programadas</p>
            </Card>

            <Card className="p-4 border-slate-200/80 hover:border-blue-200 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Realizado Pago
                </span>
                <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <DollarSign size={14} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-blue-700 mt-2.5">{formatBRL(totaisMatriz.realizado)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Efetivamente liquidado no período</p>
            </Card>

            <Card className="p-4 border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/20 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  Saldo Restante
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {totaisMatriz.pctExecucao.toFixed(1).replace('.', ',')}% executado
                </span>
              </div>
              <h3 className="text-xl font-bold text-emerald-700 mt-2.5">{formatBRL(totaisMatriz.saldoRestante)}</h3>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, totaisMatriz.pctExecucao)}%` }}
                />
              </div>
            </Card>
          </div>

          {/* Barra de Filtros: Período da Apuração & Categoria + Ajustar Teto */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filtro de Período da Apuração */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                <Calendar size={14} className="text-blue-600" /> Período da Apuração:
              </span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl flex-wrap gap-0.5">
                {[
                  { id: 'SEMESTRAL', label: 'Semestral' },
                  { id: 'TRIMESTRAL', label: 'Trimestral' },
                  { id: 'MENSAL', label: 'Mensal' },
                  { id: 'ANUAL', label: 'Anual' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPeriodoMatriz(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      periodoMatriz === tab.id
                        ? 'bg-blue-700 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Subseletor do Período */}
              {periodoMatriz === 'SEMESTRAL' && (
                <select
                  value={subPeriodoSemestre}
                  onChange={(e) => setSubPeriodoSemestre(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors"
                >
                  <option value="JAN_JUN">1º Semestre (Janeiro a Junho)</option>
                  <option value="JUL_DEZ">2º Semestre (Julho a Dezembro)</option>
                </select>
              )}

              {periodoMatriz === 'TRIMESTRAL' && (
                <select
                  value={subPeriodoTrimestre}
                  onChange={(e) => setSubPeriodoTrimestre(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors"
                >
                  <option value="T1">1º Trimestre (Janeiro a Março)</option>
                  <option value="T2">2º Trimestre (Abril a Junho)</option>
                  <option value="T3">3º Trimestre (Julho a Setembro)</option>
                  <option value="T4">4º Trimestre (Outubro a Dezembro)</option>
                </select>
              )}

              {periodoMatriz === 'MENSAL' && (
                <select
                  value={subPeriodoMes}
                  onChange={(e) => setSubPeriodoMes(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors"
                >
                  <option value="2026-10">Outubro / 2026</option>
                  <option value="2026-09">Setembro / 2026</option>
                  <option value="2026-08">Agosto / 2026</option>
                  <option value="2026-07">Julho / 2026</option>
                  <option value="2026-06">Junho / 2026</option>
                </select>
              )}
            </div>

            {/* Filtro por Categoria / Rubrica & Botão Ajustar Teto */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Filter size={13} className="text-blue-600" /> Categoria:
                </span>
                <select
                  value={filtroRubrica}
                  onChange={(e) => setFiltroRubrica(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs hover:bg-slate-100 transition-colors"
                >
                  <option value="TODAS">Todas as Rubricas (7)</option>
                  <option value="SALARIOS">Salários / Colaboradores</option>
                  <option value="UNIFORMES">Uniformes e Kits</option>
                  <option value="MATERIAIS">Materiais Esportivos</option>
                  <option value="TORNEIOS">Torneios e Campeonatos</option>
                  <option value="EVENTOS">Eventos Sociais</option>
                  <option value="ADMINISTRATIVO">Gestão Administrativa</option>
                  <option value="OUTROS">Outros e Contingência</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleOpenAjustarTeto}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
                title="Ajustar limites de teto orçamentário por categoria"
              >
                <Sliders size={13} className="text-blue-600" />
                Ajustar Teto Orçamentário
              </button>
            </div>
          </div>

          {/* Tabela Governamental Formatada Conforme a Imagem */}
          {renderMatrizTabela()}
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards Row do Livro-Caixa */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Receitas</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight size={18} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatBRL(totalReceitas)}</h3>
              <p className="text-xs text-slate-400 mt-1">Repasses, doações e patrocínios</p>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Despesas</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight size={18} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatBRL(totalDespesas)}</h3>
              <p className="text-xs text-slate-400 mt-1">Salários, materiais e uniformes</p>
            </Card>

            <Card className="hover:border-blue-200 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Operacional</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mt-2">{formatBRL(saldoReal)}</h3>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">Balanço consolidado</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('matriz')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <BarChart3 size={13} />
                  Ver Matriz Orçamentária
                </button>
              </div>
            </Card>
          </div>

          {/* Lançamentos Table Card */}
          <Card noPadding>
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['TODOS', 'ENTRADA', 'SAIDA'].map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setFiltroTipo(tipo)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      filtroTipo === tipo
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tipo === 'TODOS' ? 'Todos os Tipos' : tipo === 'ENTRADA' ? 'Entradas (+)' : 'Saídas (-)'}
                  </button>
                ))}

                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 cursor-pointer"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="PAGO">Pago</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="PROGRAMADO">Programado</option>
                </select>
              </div>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descrição ou categoria..."
                className="w-full sm:w-72 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30"
              />
            </div>

            {filteredLancamentos.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="Nenhum lançamento financeiro encontrado"
                  description="Nenhum registro atende aos filtros atuais."
                  actionText="Resetar Filtros"
                  onAction={() => {
                    setFiltroTipo('TODOS');
                    setFiltroStatus('TODOS');
                    setSearchTerm('');
                  }}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-4 px-6">Descrição</th>
                      <th className="py-4 px-4">Categoria</th>
                      <th className="py-4 px-4 text-center">Vencimento</th>
                      <th className="py-4 px-4">Forma</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4 text-right">Valor</th>
                      <th className="py-4 px-6 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLancamentos.map((item) => {
                      const isEntrada = item.tipo === 'ENTRADA';
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                  isEntrada ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}
                              >
                                {isEntrada ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 leading-tight">{item.descricao}</p>
                                {item.comprovanteUrl && (
                                  <a
                                    href={item.comprovanteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                                    title="Abrir anexo / comprovante"
                                  >
                                    {item.comprovanteTipo === 'FOTO' || item.comprovanteUrl.startsWith('data:image') ? (
                                      <Image size={12} className="text-blue-600" />
                                    ) : item.comprovanteTipo === 'URL' || item.comprovanteUrl.startsWith('http') ? (
                                      <ExternalLink size={12} className="text-blue-600" />
                                    ) : (
                                      <FileText size={12} className="text-blue-600" />
                                    )}
                                    <span>{item.comprovanteNome || 'Comprovante anexado'}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <Badge variant={item.categoria === 'SALARIOS' ? 'purple' : 'neutral'}>
                              {item.categoria === 'SALARIOS' ? 'Salários / Folha' : item.categoria}
                            </Badge>
                          </td>

                          <td className="py-4 px-4 text-center text-xs text-slate-500">
                            {item.dataVencimento}
                          </td>

                          <td className="py-4 px-4 text-xs font-medium text-slate-700">
                            {item.formaPagamento || 'PIX'}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <Badge
                              variant={
                                item.status === 'PAGO'
                                  ? 'success'
                                  : item.status === 'PENDENTE'
                                  ? 'warning'
                                  : 'info'
                              }
                            >
                              {item.status}
                            </Badge>
                          </td>

                          <td
                            className={`py-4 px-4 text-right font-bold ${
                              isEntrada ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {isEntrada ? `+ ${formatBRL(item.valor)}` : `- ${formatBRL(item.valor)}`}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all cursor-pointer border border-slate-200/80"
                                title="Editar lançamento"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLancamento(item.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border border-slate-200/80"
                                title="Excluir lançamento"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal Cadastro / Edição com estilo alinhado ao Matricular Novo Aluno */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLancamento ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
        description="Preencha os dados da receita ou despesa para registro no livro-caixa da ONG PORTO FC."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveLancamento} className="space-y-4">
          {/* Seção de Comprovante / Anexo (Foto, Arquivo ou URL) */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Comprovante / Nota Fiscal / Anexo
              </span>
              {form.comprovanteUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, comprovanteUrl: '', comprovanteNome: '' })}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Remover anexo
                </button>
              )}
            </div>

            {/* Seletor do Tipo de Inserção: Foto, Arquivo ou URL */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setForm({ ...form, comprovanteTipo: 'FOTO' })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  form.comprovanteTipo === 'FOTO'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Image size={13} />
                Foto / Imagem
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, comprovanteTipo: 'ARQUIVO' })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  form.comprovanteTipo === 'ARQUIVO'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Paperclip size={13} />
                Arquivo / Documento
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, comprovanteTipo: 'URL' })}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  form.comprovanteTipo === 'URL'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Link size={13} />
                Link / URL
              </button>
            </div>

            {/* Inserir Foto */}
            {form.comprovanteTipo === 'FOTO' && (
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                <div className="relative group shrink-0">
                  {form.comprovanteUrl ? (
                    <img
                      src={form.comprovanteUrl}
                      alt="Foto do Comprovante"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-600/30 shadow-sm"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-200 text-slate-400 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                      <Image size={28} />
                      <span className="text-[10px] text-slate-500 font-medium mt-0.5">Sem foto</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors shadow-xs">
                      <Upload size={14} />
                      <span>Escolher foto do dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                    <span className="text-xs text-slate-400">ou cole a URL da imagem abaixo</span>
                  </div>
                  <input
                    type="url"
                    value={form.comprovanteUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        comprovanteUrl: e.target.value,
                        comprovanteNome: form.comprovanteNome || 'Foto Comprovante',
                      })
                    }
                    placeholder="https://exemplo.com/comprovante.jpg"
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
                  />
                </div>
              </div>
            )}

            {/* Inserir Arquivo */}
            {form.comprovanteTipo === 'ARQUIVO' && (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors shadow-xs">
                    <Upload size={14} />
                    <span>Selecionar Arquivo (PDF, Nota Fiscal, Documento)</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <span className="text-xs text-slate-400">PDF, DOC ou planilha até 10MB</span>
                </div>
                {form.comprovanteNome && (
                  <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={16} className="text-blue-600 shrink-0" />
                      <span className="truncate">{form.comprovanteNome}</span>
                    </div>
                    <span className="text-[10px] bg-blue-200/70 text-blue-800 px-2 py-0.5 rounded-md font-bold shrink-0">
                      Anexado
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Inserir Link / URL */}
            {form.comprovanteTipo === 'URL' && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-medium text-slate-500">
                  Endereço Web / Link do Comprovante ou Pasta na Nuvem
                </label>
                <div className="relative">
                  <Link size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={form.comprovanteUrl}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        comprovanteUrl: e.target.value,
                        comprovanteNome: form.comprovanteNome || 'Link Externo',
                      })
                    }
                    placeholder="https://drive.google.com/file/... ou https://receita.fazenda.gov.br/..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">
                  Insira o link para visualização da Nota Fiscal Eletrônica ou pasta no Google Drive.
                </span>
              </div>
            )}
          </div>

          {/* Grid de Campos Idêntico ao AlunosModule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Tipo de Lançamento <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLancamento })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700 cursor-pointer"
              >
                <option value="SAIDA">Saída / Despesa (-)</option>
                <option value="ENTRADA">Entrada / Receita (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Categoria <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700 cursor-pointer"
              >
                <option value="MATERIAIS">Materiais Esportivos</option>
                <option value="UNIFORMES">Uniformes</option>
                <option value="SALARIOS">Salários / Folha</option>
                <option value="TORNEIOS">Torneios</option>
                <option value="EVENTOS">Eventos</option>
                <option value="ADMINISTRATIVO">Administrativo</option>
                <option value="REPASSES">Repasses Públicos</option>
                <option value="DOACOES">Doações</option>
                <option value="PATROCINIOS">Patrocínios</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Descrição do Lançamento <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Ex: Aquisição de Bolas Penalty e Cones"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Valor (R$) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Data de Vencimento <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Forma de Pagamento
              </label>
              <select
                value={form.formaPagamento}
                onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700 cursor-pointer"
              >
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto Bancário</option>
                <option value="TRANSFERENCIA">Transferência / TED</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Status do Lançamento
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusFinanceiro })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700 cursor-pointer"
              >
                <option value="PAGO">Pago / Liquidado</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PROGRAMADO">Programado</option>
              </select>
            </div>

            {form.status === 'PAGO' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Data do Pagamento Efetivo
                </label>
                <input
                  type="date"
                  value={form.dataPagamento}
                  onChange={(e) => setForm({ ...form, dataPagamento: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              {editingLancamento ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Acompanhamento Orçamentário com Design Limpo e Gráfico */}
      <Modal
        isOpen={isOrcamentoModalOpen}
        onClose={() => setIsOrcamentoModalOpen(false)}
        title="Acompanhamento Orçamentário"
        description="Planejamento e confrontação de metas orçamentárias vs gastos realizados."
        maxWidth="2xl"
      >
        <div className="space-y-5">
          {/* Barra de Filtro de Períodos Limpa e Moderna */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center gap-1">
              {[
                { id: 'MENSAL', label: 'Mensal' },
                { id: 'TRIMESTRAL', label: 'Trimestral' },
                { id: 'SEMESTRAL', label: 'Semestral' },
                { id: 'ANUAL', label: 'Anual' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFiltroOrcamento(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    filtroOrcamento === tab.id
                      ? 'bg-blue-700 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-seletores compactos */}
            {filtroOrcamento === 'MENSAL' && (
              <select
                value={selectedMesOrcamento}
                onChange={(e) => setSelectedMesOrcamento(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 font-medium text-slate-700 focus:ring-2 focus:ring-blue-600/30 cursor-pointer"
              >
                <option value="TODOS">Todos os Meses ({orcamentos.length})</option>
                {orcamentos.map((o) => (
                  <option key={o.mesReferencia} value={o.mesReferencia}>
                    {formatMesNome(o.mesReferencia)}
                  </option>
                ))}
              </select>
            )}

            {filtroOrcamento === 'TRIMESTRAL' && (
              <div className="flex items-center gap-1">
                {[
                  { id: 'T1', label: '1º Trim (Ago-Out)' },
                  { id: 'T2', label: '2º Trim (Nov-Jan)' },
                  { id: 'T3', label: '3º Trim (Fev-Abr)' },
                  { id: 'T4', label: '4º Trim (Mai-Jul)' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTrimestre(t.id as any)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedTrimestre === t.id
                        ? 'bg-blue-100 text-blue-900 font-bold border border-blue-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {filtroOrcamento === 'SEMESTRAL' && (
              <div className="flex items-center gap-1">
                {[
                  { id: 'S1', label: '1º Semestre (Ago-Jan)' },
                  { id: 'S2', label: '2º Semestre (Fev-Jul)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSemestre(s.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedSemestre === s.id
                        ? 'bg-blue-100 text-blue-900 font-bold border border-blue-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {filtroOrcamento === 'ANUAL' && (
              <span className="text-xs font-semibold text-slate-600 px-3 py-1 bg-white border border-slate-200 rounded-xl">
                12 Meses de Convênio
              </span>
            )}
          </div>

          {/* Painel Executivo / Gráfico Resumido (Sem poluição visual) */}
          <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 rounded-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-3 border-b border-slate-200/70">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Orçamento Previsto
                </span>
                <p className="text-xl font-bold text-slate-800 mt-0.5">
                  {formatBRL(dadosOrcamentoExibicao.totalPrevisto)}
                </p>
                <span className="text-[11px] text-slate-500">Teto orçamentário definido</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Gasto Realizado
                </span>
                <p className="text-xl font-bold text-blue-700 mt-0.5">
                  {formatBRL(dadosOrcamentoExibicao.totalRealizado)}
                </p>
                <span className="text-[11px] text-slate-500">Executado no período</span>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Economia / Saldo
                </span>
                <p className="text-xl font-bold text-emerald-700 mt-0.5">
                  {formatBRL(dadosOrcamentoExibicao.totalDiferenca)}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium">Margem positiva restante</span>
              </div>
            </div>

            {/* Barra Gráfica de Execução */}
            <div className="pt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-blue-600" />
                  Taxa de Execução Orçamentária
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                    dadosOrcamentoExibicao.pctGeral > 100
                      ? 'bg-rose-100 text-rose-800'
                      : dadosOrcamentoExibicao.pctGeral > 80
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {dadosOrcamentoExibicao.pctGeral}% executado
                </span>
              </div>
              <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    dadosOrcamentoExibicao.pctGeral > 100
                      ? 'bg-rose-500'
                      : dadosOrcamentoExibicao.pctGeral > 80
                      ? 'bg-amber-500'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${Math.min(100, dadosOrcamentoExibicao.pctGeral)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tabela Comparativa Limpa e Gráfica */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-left text-xs text-slate-600 border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="py-3 px-4">Período</th>
                    <th className="py-3 px-4 text-right">Previsto</th>
                    <th className="py-3 px-4 text-right">Realizado</th>
                    <th className="py-3 px-4 text-right">Economia/Saldo</th>
                    <th className="py-3 px-4 text-center w-36">Execução</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtroOrcamento === 'ANUAL'
                    ? trimestresConsolidados.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">{t.label}</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-700">
                            {formatBRL(t.previsto)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-blue-700">
                            {formatBRL(t.realizado)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-700">
                            {formatBRL(t.diferenca)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    t.pct > 100 ? 'bg-rose-500' : t.pct > 80 ? 'bg-amber-500' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${Math.min(100, t.pct)}%` }}
                                />
                              </div>
                              <span className="font-bold text-[11px] text-slate-700 w-8 text-right">
                                {t.pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    : dadosOrcamentoExibicao.itens.map((orc) => {
                        const pct = orc.previsto > 0 ? Math.round((orc.realizado / orc.previsto) * 100) : 0;
                        return (
                          <tr key={orc.mesReferencia} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800">
                              {formatMesNome(orc.mesReferencia)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-700">
                              {formatBRL(orc.previsto)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-blue-700">
                              {formatBRL(orc.realizado)}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-700">
                              {formatBRL(orc.diferenca)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${
                                      pct > 100 ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${Math.min(100, pct)}%` }}
                                  />
                                </div>
                                <span className="font-bold text-[11px] text-slate-700 w-8 text-right">
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rodapé do Modal */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsOrcamentoModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Ajustar Teto Orçamentário por Categoria (Financeiro) */}
      <Modal
        isOpen={isAjustarTetoModalOpen}
        onClose={() => setIsAjustarTetoModalOpen(false)}
        title="Ajustar Teto Orçamentário por Categoria"
        description="Defina os limites de orçamento previsto para cada rubrica governamental da emenda parlamentar."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveTetos} className="space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs text-blue-800">
            <AlertCircle size={15} className="shrink-0 text-blue-600" />
            <span>
              Os tetos informados abaixo atualizam automaticamente a <strong>Matriz Orçamentária Governamental</strong> e o cálculo dos saldos disponíveis.
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {rubricas.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">{r.nome}</p>
                  <p className="text-[11px] text-slate-500">
                    Comprometido: {formatBRL(r.comprometido)} • Realizado: {formatBRL(r.realizado)}
                  </p>
                </div>
                <div className="w-full sm:w-44 shrink-0">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Teto Previsto (R$)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    required
                    value={tetoFormData[r.id] ?? ''}
                    onChange={(e) =>
                      setTetoFormData({
                        ...tetoFormData,
                        [r.id]: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-blue-600/30 text-right"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Somatório Total em Tempo Real */}
          {(() => {
            const somaTotal = Object.values(tetoFormData).reduce((acc, v) => {
              const num = parseFloat(v?.replace(',', '.') || '0') || 0;
              return acc + num;
            }, 0);

            return (
              <div className="p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Geral da Emenda (Previsto)
                  </span>
                  <span className="text-xs text-slate-300">Soma consolidada das 7 rubricas</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold tracking-tight text-white">{formatBRL(somaTotal)}</span>
                </div>
              </div>
            );
          })()}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsAjustarTetoModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              Salvar Tetos Orçamentários
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

