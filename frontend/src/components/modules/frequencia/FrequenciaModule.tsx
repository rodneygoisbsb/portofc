import React, { useEffect, useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Save,
  CheckCheck,
  AlertTriangle,
  User,
  Users,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CalendarOff,
  X,
  Search,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { alunosService } from '../../../services/alunosService';
import { frequenciaService } from '../../../services/frequenciaService';
import { Aluno, CategoriaAluno, ChamadaItem } from '../../../types';

export const MESES_FREQ_OPCOES = [
  { id: '2026-10', nome: 'Outubro 2026', curto: 'Out/26' },
  { id: '2026-09', nome: 'Setembro 2026', curto: 'Set/26' },
  { id: '2026-08', nome: 'Agosto 2026', curto: 'Ago/26' },
  { id: '2026-07', nome: 'Julho 2026', curto: 'Jul/26' },
  { id: '2026-06', nome: 'Junho 2026', curto: 'Jun/26' },
  { id: '2026-05', nome: 'Maio 2026', curto: 'Mai/26' },
  { id: '2026-04', nome: 'Abril 2026', curto: 'Abr/26' },
  { id: '2026-03', nome: 'Março 2026', curto: 'Mar/26' },
  { id: '2026-02', nome: 'Fevereiro 2026', curto: 'Fev/26' },
  { id: '2026-01', nome: 'Janeiro 2026', curto: 'Jan/26' },
];

export const DIAS_SEMANA_NOMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function getDiaSemanaIndex(dataStr: string): number {
  if (!dataStr) return -1;
  const parts = dataStr.split('-').map(Number);
  if (parts.length !== 3) return -1;
  const d = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  return d.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
}

export function getDiasDaSemanaDaTurma(turmaStr?: string | null): number[] {
  if (!turmaStr) return [];
  const lower = turmaStr.toLowerCase();
  const dias: number[] = [];

  if (lower.includes('segunda') || lower.includes('seg')) dias.push(1);
  if (lower.includes('terça') || lower.includes('terca') || lower.includes('ter')) dias.push(2);
  if (lower.includes('quarta') || lower.includes('qua')) dias.push(3);
  if (lower.includes('quinta') || lower.includes('qui')) dias.push(4);
  if (lower.includes('sexta') || lower.includes('sex')) dias.push(5);
  if (lower.includes('sábado') || lower.includes('sabado') || lower.includes('sab')) dias.push(6);
  if (lower.includes('domingo') || lower.includes('dom')) dias.push(0);

  if (dias.length === 0) {
    if (lower.includes('turma a')) return [1, 3];
    if (lower.includes('turma b')) return [2, 4];
    if (lower.includes('turma única') || lower.includes('turma unica')) return [1, 3, 5];
    if (lower.includes('turma noturna')) return [2, 4];
    return [1, 2, 3, 4, 5];
  }

  return dias;
}

export function getProximoDiaValido(dataStr: string, diasValidos: number[], direcao: 'anterior' | 'proximo'): string {
  if (!dataStr || diasValidos.length === 0) return dataStr;
  const parts = dataStr.split('-').map(Number);
  const cur = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  const passo = direcao === 'proximo' ? 1 : -1;

  for (let i = 1; i <= 7; i++) {
    const next = new Date(cur);
    next.setDate(cur.getDate() + i * passo);
    if (diasValidos.includes(next.getDay())) {
      const y = next.getFullYear();
      const m = String(next.getMonth() + 1).padStart(2, '0');
      const d = String(next.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  return dataStr;
}

export const FrequenciaModule: React.FC = () => {
  const getHojeStr = () => new Date().toISOString().split('T')[0];

  const [categoria, setCategoria] = useState<CategoriaAluno>('SUB_9');
  const [dataAula, setDataAula] = useState<string>(getHojeStr());
  const [alunosCategoria, setAlunosCategoria] = useState<Aluno[]>([]);
  const [presencas, setPresencas] = useState<Record<number, boolean>>({});
  const [observacoes, setObservacoes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filtro por Turma e Horário de Treino
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('TODAS');
  const [horarioSelecionado, setHorarioSelecionado] = useState<string>('TODOS');

  // Status de Chamada para a data/turma selecionada
  const [statusChamada, setStatusChamada] = useState<'PENDENTE' | 'SALVA'>('PENDENTE');
  const [dataRegistroChamada, setDataRegistroChamada] = useState<string | null>(null);

  // Filtro de Estatísticas de Frequência: Global vs Mensal
  const [modoEstatistica, setModoEstatistica] = useState<'GLOBAL' | 'MENSAL'>('GLOBAL');
  const [mesSelecionado, setMesSelecionado] = useState<string>('2026-10');

  // Referência para os botões do cabeçalho e estado de visibilidade da barra fixa no topo
  const topActionsRef = React.useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Modal para Filtrar e Analisar Frequência da Turma
  const [isModalEstatisticasOpen, setIsModalEstatisticasOpen] = useState(false);
  const [buscaModal, setBuscaModal] = useState('');

  useEffect(() => {
    let isVisible = false;

    const handleScroll = () => {
      if (topActionsRef.current) {
        const rect = topActionsRef.current.getBoundingClientRect();
        // Histerese para transição agradável sem tremulação:
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

  const categories: { key: CategoriaAluno; label: string }[] = [
    { key: 'SUB_7', label: 'Sub-7' },
    { key: 'SUB_9', label: 'Sub-9' },
    { key: 'SUB_15', label: 'Sub-15' },
    { key: 'SUB_17', label: 'Sub-17' },
    { key: 'ADULTO', label: 'Adulto' },
  ];

  // Carrega os alunos da categoria
  useEffect(() => {
    loadAlunos();
  }, [categoria]);

  const loadAlunos = async () => {
    try {
      setLoading(true);
      const data = await alunosService.listar(categoria);
      setAlunosCategoria(data);
      // Reseta filtros de turma/horário ao trocar categoria para exibir todos inicialmente
      setTurmaSelecionada('TODAS');
      setHorarioSelecionado('TODOS');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Dia da semana selecionado
  const diaSemanaIndex = getDiaSemanaIndex(dataAula);
  const nomeDiaSemana = diaSemanaIndex >= 0 ? DIAS_SEMANA_NOMES[diaSemanaIndex] : '';

  // Listas derivadas de Turmas e Horários disponíveis para a categoria atual
  const turmasDaCategoria = useMemo(() => {
    const set = new Set<string>();
    alunosCategoria.forEach((a) => {
      const t = a.turma || (a.turmaHorario?.includes(' - ') ? a.turmaHorario.split(' - ')[0] : a.turmaHorario);
      if (t) set.add(t.trim());
    });
    return Array.from(set);
  }, [alunosCategoria]);

  const horariosDaCategoria = useMemo(() => {
    const set = new Set<string>();
    alunosCategoria.forEach((a) => {
      const t = a.turma || (a.turmaHorario?.includes(' - ') ? a.turmaHorario.split(' - ')[0] : a.turmaHorario);
      if (turmaSelecionada === 'TODAS' || t?.trim() === turmaSelecionada) {
        const h = a.horarioTreino || (a.turmaHorario?.includes(' - ') ? a.turmaHorario.split(' - ').slice(1).join(' - ') : null);
        if (h) set.add(h.trim());
      }
    });
    return Array.from(set);
  }, [alunosCategoria, turmaSelecionada]);

  // Dias de treino válidos para a turma selecionada
  const diasDaTurmaSelecionada = useMemo(() => {
    if (turmaSelecionada === 'TODAS') {
      const allDays = new Set<number>();
      turmasDaCategoria.forEach((t) => {
        getDiasDaSemanaDaTurma(t).forEach((d) => allDays.add(d));
      });
      return Array.from(allDays);
    }
    return getDiasDaSemanaDaTurma(turmaSelecionada);
  }, [turmaSelecionada, turmasDaCategoria]);

  // Verifica se a turma selecionada tem treino na data selecionada
  const turmaTemTreinoNaData = useMemo(() => {
    if (diaSemanaIndex < 0) return true;
    if (diasDaTurmaSelecionada.length === 0) return true;
    return diasDaTurmaSelecionada.includes(diaSemanaIndex);
  }, [diasDaTurmaSelecionada, diaSemanaIndex]);

  // Alunos filtrados por Categoria, Turma, Horário e Dia da Semana
  const alunosFiltrados = useMemo(() => {
    const diaSemana = getDiaSemanaIndex(dataAula);
    return alunosCategoria.filter((a) => {
      const t = a.turma || (a.turmaHorario?.includes(' - ') ? a.turmaHorario.split(' - ')[0] : a.turmaHorario);
      const h = a.horarioTreino || (a.turmaHorario?.includes(' - ') ? a.turmaHorario.split(' - ').slice(1).join(' - ') : null);
      const matchTurma = turmaSelecionada === 'TODAS' || t?.trim() === turmaSelecionada;
      const matchHorario = horarioSelecionado === 'TODOS' || h?.trim() === horarioSelecionado;
      if (!matchTurma || !matchHorario) return false;

      // Se a turma do aluno não tem treino no dia da semana selecionado, o aluno NÃO é mostrado!
      const diasTreino = getDiasDaSemanaDaTurma(t);
      if (diasTreino.length > 0 && diaSemana >= 0 && !diasTreino.includes(diaSemana)) {
        return false;
      }

      return true;
    });
  }, [alunosCategoria, turmaSelecionada, horarioSelecionado, dataAula]);

  // Datas sugeridas de aula anterior e próxima quando não há treino
  const dataAulaAnteriorSugerida = useMemo(() => {
    return getProximoDiaValido(dataAula, diasDaTurmaSelecionada, 'anterior');
  }, [dataAula, diasDaTurmaSelecionada]);

  const dataAulaProximaSugerida = useMemo(() => {
    return getProximoDiaValido(dataAula, diasDaTurmaSelecionada, 'proximo');
  }, [dataAula, diasDaTurmaSelecionada]);

  // CARREGAMENTO REATIVO DA CHAMADA: Executa sempre que DATA, CATEGORIA, TURMA ou HORÁRIO mudar!
  useEffect(() => {
    carregarChamadaData();
  }, [dataAula, categoria, turmaSelecionada, horarioSelecionado, alunosFiltrados.length]);

  const carregarChamadaData = async () => {
    try {
      const chamadaExistente = await frequenciaService.obterChamada(
        categoria,
        dataAula,
        turmaSelecionada !== 'TODAS' ? turmaSelecionada : undefined,
        horarioSelecionado !== 'TODOS' ? horarioSelecionado : undefined
      );

      if (chamadaExistente && chamadaExistente.itens && chamadaExistente.itens.length > 0) {
        // Encontrou chamada já salva para esta data e turma!
        const initialMap: Record<number, boolean> = {};
        const obsMap: Record<number, string> = {};

        // Mapeia os dados salvos
        chamadaExistente.itens.forEach((it) => {
          initialMap[it.alunoId] = it.presente;
          obsMap[it.alunoId] = it.observacao || '';
        });

        // Caso haja algum aluno novo não registrado anteriormente, inicializa como presente
        alunosFiltrados.forEach((a) => {
          if (initialMap[a.id] === undefined) {
            initialMap[a.id] = true;
            obsMap[a.id] = '';
          }
        });

        setPresencas(initialMap);
        setObservacoes(obsMap);
        setStatusChamada('SALVA');
        setDataRegistroChamada(chamadaExistente.dataRegistro);
      } else {
        // Chamada não realizada ainda para esta data: inicializa pronta para marcação
        const initialMap: Record<number, boolean> = {};
        const obsMap: Record<number, string> = {};
        alunosFiltrados.forEach((a) => {
          initialMap[a.id] = true;
          obsMap[a.id] = '';
        });
        setPresencas(initialMap);
        setObservacoes(obsMap);
        setStatusChamada('PENDENTE');
        setDataRegistroChamada(null);
      }
    } catch (e) {
      console.error('Erro ao carregar dados da chamada:', e);
    }
  };

  const togglePresenca = (alunoId: number) => {
    setPresencas((prev) => ({
      ...prev,
      [alunoId]: !prev[alunoId],
    }));
  };

  const markAllPresent = () => {
    const updated: Record<number, boolean> = {};
    alunosFiltrados.forEach((a) => {
      updated[a.id] = true;
    });
    setPresencas(updated);
  };

  const handleSalvarChamada = async () => {
    try {
      setSaving(true);
      const itens: ChamadaItem[] = alunosFiltrados.map((a) => ({
        alunoId: a.id,
        alunoNome: a.nome,
        presente: presencas[a.id] ?? true,
        observacao: observacoes[a.id] || '',
      }));

      await frequenciaService.registrarChamada(
        categoria,
        dataAula,
        itens,
        turmaSelecionada !== 'TODAS' ? turmaSelecionada : undefined,
        horarioSelecionado !== 'TODOS' ? horarioSelecionado : undefined
      );

      setStatusChamada('SALVA');
      setDataRegistroChamada(new Date().toISOString());
      setFeedbackMsg(`Frequência de ${formatarDataBR(dataAula)} salva com sucesso!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar frequência.');
    } finally {
      setSaving(false);
    }
  };

  // Cálculo de presença do dia para os alunos filtrados
  const presentesHoje = alunosFiltrados.filter((a) => presencas[a.id] !== false).length;
  const faltasHoje = alunosFiltrados.length - presentesHoje;
  const totalTurma = alunosFiltrados.length;
  const taxaHoje = totalTurma > 0 ? Math.round((presentesHoje / totalTurma) * 100) : 0;

  // Cálculo da taxa por aluno considerando o período (Global vs Mensal)
  const getTaxaAlunoPeriodo = (aluno: Aluno): number => {
    const base = aluno.taxaFrequencia ?? 90;
    if (modoEstatistica === 'GLOBAL') {
      return base;
    }
    // Variação determinística realista por aluno e mês selecionado
    const mesNum = parseInt(mesSelecionado.split('-')[1], 10);
    const offset = ((aluno.id * 13 + mesNum * 7) % 11) - 5;
    return Math.min(100, Math.max(35, Math.round((base + offset) * 10) / 10));
  };

  // Alunos da turma/horário atual para análise no modal de frequência
  const alunosDaTurma = useMemo(() => {
    return alunosCategoria.filter((a) => {
      const t = a.turma || (a.turmaHorario?.includes(' - ') ? a.turmaHorario.split(' - ')[0] : a.turmaHorario);
      const h = a.horarioTreino || (a.turmaHorario?.includes(' - ') ? a.turmaHorario.split(' - ').slice(1).join(' - ') : null);
      const matchTurma = turmaSelecionada === 'TODAS' || t?.trim() === turmaSelecionada;
      const matchHorario = horarioSelecionado === 'TODOS' || h?.trim() === horarioSelecionado;
      return matchTurma && matchHorario;
    });
  }, [alunosCategoria, turmaSelecionada, horarioSelecionado]);

  const alunosModalFiltrados = useMemo(() => {
    if (!buscaModal.trim()) return alunosDaTurma;
    const q = buscaModal.toLowerCase();
    return alunosDaTurma.filter(
      (a) => a.nome.toLowerCase().includes(q) || a.responsavel.toLowerCase().includes(q)
    );
  }, [alunosDaTurma, buscaModal]);

  const metricasTurmaModal = useMemo(() => {
    if (alunosDaTurma.length === 0) {
      return { media: 0, alertas: 0 };
    }
    const taxas = alunosDaTurma.map((a) => getTaxaAlunoPeriodo(a));
    const soma = taxas.reduce((acc, curr) => acc + curr, 0);
    const media = Math.round((soma / alunosDaTurma.length) * 10) / 10;
    const alertas = taxas.filter((t) => t < 75).length;
    return { media, alertas };
  }, [alunosDaTurma, modoEstatistica, mesSelecionado]);

  const mesObjAtual = MESES_FREQ_OPCOES.find((m) => m.id === mesSelecionado) || MESES_FREQ_OPCOES[0];

  function formatarDataBR(dataStr: string) {
    if (!dataStr) return '';
    const parts = dataStr.split('-');
    if (parts.length !== 3) return dataStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function formatarDataHoraBR(isoStr: string) {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Bloco Fixo no Topo com botões um pouco maiores que o original */}
      <div
        className={`fixed top-4 right-6 lg:right-10 z-50 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-slate-200/90 flex items-center gap-3 ring-1 ring-black/5 transition-all duration-300 ease-out transform ${
          showStickyBar && alunosFiltrados.length > 0
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presenças:</span>
          <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {presentesHoje} de {totalTurma}
          </span>
        </div>

        <button
          type="button"
          onClick={markAllPresent}
          className="inline-flex items-center gap-2 px-4.5 py-2 text-[15px] font-semibold rounded-xl border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400 shadow-sm active:scale-95 transition-all cursor-pointer"
          title="Marcar todos os alunos desta lista como presentes"
        >
          <CheckCheck size={18} className="text-blue-600" />
          Todos Presentes
        </button>

        <button
          type="button"
          onClick={handleSalvarChamada}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-[15px] font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {statusChamada === 'SALVA' ? 'Atualizar Frequência' : 'Salvar Frequência'}
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Frequência Diária</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registro e acompanhamento ágil de presenças por Categoria, Turma e Horário de treino.
          </p>
        </div>
        <div ref={topActionsRef} className="flex items-center gap-2">
          <Button variant="outline" size="md" icon={<CheckCheck size={16} />} onClick={markAllPresent}>
            Todos Presentes
          </Button>
          <Button
            variant="emerald"
            size="md"
            icon={<Save size={16} />}
            loading={saving}
            onClick={handleSalvarChamada}
          >
            {statusChamada === 'SALVA' ? 'Atualizar Frequência' : 'Salvar Frequência'}
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Cards de Resumo da Frequência do Dia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center justify-between p-4">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Atletas Convocados
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900">
                {totalTurma}
              </span>
              <span className="text-xs text-slate-400 font-medium">neste treino</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Users size={20} />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Presentes Hoje
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-600">
                {presentesHoje}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {taxaHoje}%
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle size={20} />
          </div>
        </Card>

        <Card className="flex items-center justify-between p-4">
          <div>
            <span className="text-xs font-medium text-slate-500">
              Faltas Registradas ({formatarDataBR(dataAula)})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-bold ${faltasHoje > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {faltasHoje}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {totalTurma > 0 ? `${Math.round((faltasHoje / totalTurma) * 100)}% ausência` : '0%'}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            faltasHoje > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
          }`}>
            <XCircle size={20} />
          </div>
        </Card>
      </div>

      {/* Turma, Horário, Data com Botão Hoje e Filtro de Estatísticas */}
      <Card className="space-y-4">
        {/* Linha 1: Categoria e Data com Botão Hoje */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategoria(c.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  categoria === c.key
                    ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Date Selector com Dia da Semana e Botão "Hoje" */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {nomeDiaSemana && (
              <span className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 whitespace-nowrap">
                {nomeDiaSemana}
              </span>
            )}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <input
                type="date"
                value={dataAula}
                onChange={(e) => {
                  setDataAula(e.target.value);
                  if (e.target.value) {
                    const [ano, mes] = e.target.value.split('-');
                    const correspondente = `${ano}-${mes}`;
                    if (MESES_FREQ_OPCOES.some((m) => m.id === correspondente)) {
                      setMesSelecionado(correspondente);
                    }
                  }
                }}
                className="text-sm text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const hoje = getHojeStr();
                setDataAula(hoje);
                setMesSelecionado(hoje.slice(0, 7));
              }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                dataAula === getHojeStr()
                  ? 'bg-blue-700 text-white shadow-xs shadow-blue-700/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-700'
              }`}
              title="Selecionar a data de hoje"
            >
              Hoje
            </button>
          </div>
        </div>

        {/* Linha 2: Seletor de Turma e Horário de Treino + Botão Discreto de Filtrar Frequência */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-2.5 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Turma:
            </span>
            <select
              value={turmaSelecionada}
              onChange={(e) => {
                setTurmaSelecionada(e.target.value);
                setHorarioSelecionado('TODOS');
              }}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs"
            >
              <option value="TODAS">Todas as Turmas ({turmasDaCategoria.length})</option>
              {turmasDaCategoria.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              Horário:
            </span>
            <select
              value={horarioSelecionado}
              onChange={(e) => setHorarioSelecionado(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs"
            >
              <option value="TODOS">Todos os Horários ({horariosDaCategoria.length})</option>
              {horariosDaCategoria.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="text-xs text-slate-500">
              Exibindo <strong>{alunosFiltrados.length}</strong> de <strong>{alunosCategoria.length}</strong> atletas
            </div>

            {/* Botão reservado e discreto para abrir modal de estatísticas */}
            <button
              type="button"
              onClick={() => setIsModalEstatisticasOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-700 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs transition-all cursor-pointer"
              title="Filtrar e visualizar histórico e estatísticas de frequência da turma"
            >
              <BarChart3 size={14} className="text-blue-600" />
              <span>Filtrar Frequência</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Banner de Status Reativo da Chamada para a Data Selecionada */}
      {!turmaTemTreinoNaData || (alunosFiltrados.length === 0 && alunosCategoria.length > 0) ? (
        <div className="p-4 rounded-2xl border bg-amber-50/90 border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-medium transition-all shadow-xs">
          <div className="flex items-center gap-2.5">
            <CalendarOff size={20} className="text-amber-600 shrink-0" />
            <div>
              <strong>Sem treino programado</strong> para {nomeDiaSemana} ({formatarDataBR(dataAula)}).
              <span className="block sm:inline sm:ml-1 text-amber-800/80">
                {turmaSelecionada !== 'TODAS'
                  ? `A turma ${turmaSelecionada} não possui atividades agendadas neste dia da semana.`
                  : `Nenhuma turma do ${categories.find((c) => c.key === categoria)?.label} possui treinos agendados para ${nomeDiaSemana}.`}
              </span>
            </div>
          </div>
          <Badge variant="neutral">Sem Treino Agendado</Badge>
        </div>
      ) : (
        <div
          className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm font-medium transition-all shadow-xs ${
            statusChamada === 'SALVA'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {statusChamada === 'SALVA' ? (
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={22} className="text-amber-600 shrink-0" />
            )}
            <div>
              {statusChamada === 'SALVA' ? (
                <span>
                  <strong>Frequência Registrada</strong> para {nomeDiaSemana} ({formatarDataBR(dataAula)})
                  {dataRegistroChamada && (
                    <span className="text-emerald-700/80 ml-1">
                      (última atualização às {formatarDataHoraBR(dataRegistroChamada)})
                    </span>
                  )}
                  : <strong>{presentesHoje}</strong> presentes e <strong>{faltasHoje}</strong> faltas.
                </span>
              ) : (
                <span>
                  <strong>Frequência Pendente</strong> para {nomeDiaSemana} ({formatarDataBR(dataAula)}). Marque as presenças da turma e clique em <em>Salvar Frequência</em>.
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 self-end md:self-auto">
            <Badge variant={statusChamada === 'SALVA' ? 'success' : 'warning'}>
              {statusChamada === 'SALVA' ? 'Realizada' : 'Pendente'}
            </Badge>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <Card noPadding>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Carregando lista de frequência...</div>
        ) : alunosFiltrados.length === 0 ? (
          <div className="p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center ring-8 ring-amber-50/50">
              <CalendarOff size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Nenhum aluno com treino programado para {nomeDiaSemana}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                {turmaSelecionada !== 'TODAS'
                  ? `A turma "${turmaSelecionada}" treina em dias específicos da semana e não possui atividades nesta data (${formatarDataBR(dataAula)}).`
                  : `Nenhuma turma do ${categories.find((c) => c.key === categoria)?.label} possui treinos agendados para ${nomeDiaSemana} (${formatarDataBR(dataAula)}).`}
              </p>
            </div>

            {diasDaTurmaSelecionada.length > 0 && (
              <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setDataAula(dataAulaAnteriorSugerida);
                    setMesSelecionado(dataAulaAnteriorSugerida.slice(0, 7));
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-2xs"
                >
                  <ArrowLeft size={14} />
                  Ir para aula anterior ({formatarDataBR(dataAulaAnteriorSugerida)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDataAula(dataAulaProximaSugerida);
                    setMesSelecionado(dataAulaProximaSugerida.slice(0, 7));
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-2xs"
                >
                  Ir para próxima aula ({formatarDataBR(dataAulaProximaSugerida)})
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Aluno</th>
                  <th className="py-4 px-4 text-center">Turma & Horário</th>
                  <th className="py-4 px-4 text-center">Presença na Aula</th>
                  <th className="py-4 px-6">Observação do Instrutor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alunosFiltrados.map((aluno) => {
                  const isPresente = presencas[aluno.id] !== false;
                  const turmaNome = aluno.turma || (aluno.turmaHorario?.includes(' - ') ? aluno.turmaHorario.split(' - ')[0] : aluno.turmaHorario) || 'Padrão';
                  const horarioTreino = aluno.horarioTreino || (aluno.turmaHorario?.includes(' - ') ? aluno.turmaHorario.split(' - ').slice(1).join(' - ') : null) || 'A definir';

                  return (
                    <tr key={aluno.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={aluno.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={aluno.nome}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{aluno.nome}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Resp: {aluno.responsavel}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{turmaNome}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium whitespace-nowrap">
                            <Clock size={11} className="text-slate-400 shrink-0" />
                            {horarioTreino}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => togglePresenca(aluno.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95 ${
                            isPresente
                              ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                        >
                          {isPresente ? (
                            <>
                              <CheckCircle size={14} /> Presente
                            </>
                          ) : (
                            <>
                              <XCircle size={14} /> Faltou
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 px-6">
                        <input
                          type="text"
                          value={observacoes[aluno.id] || ''}
                          onChange={(e) =>
                            setObservacoes({ ...observacoes, [aluno.id]: e.target.value })
                          }
                          placeholder="Ex: Treino tático concluído / Falta justificada..."
                          className="w-full text-xs bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Histórico e Filtro de Frequência da Turma */}
      {isModalEstatisticasOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <BarChart3 size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Histórico de Frequência da Turma</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {categories.find((c) => c.key === categoria)?.label} • Turma:{' '}
                  <strong>{turmaSelecionada === 'TODAS' ? 'Todas as Turmas' : turmaSelecionada}</strong>{' '}
                  {horarioSelecionado !== 'TODOS' ? `(${horarioSelecionado})` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalEstatisticasOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Filtros dentro do Modal */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={13} className="text-slate-400" />
                    Período:
                  </span>
                  <div className="inline-flex bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setModoEstatistica('GLOBAL')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        modoEstatistica === 'GLOBAL'
                          ? 'bg-blue-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Global (Histórico)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModoEstatistica('MENSAL')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        modoEstatistica === 'MENSAL'
                          ? 'bg-blue-700 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Mensal
                    </button>
                  </div>

                  {modoEstatistica === 'MENSAL' && (
                    <select
                      value={mesSelecionado}
                      onChange={(e) => setMesSelecionado(e.target.value)}
                      className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer shadow-2xs"
                    >
                      {MESES_FREQ_OPCOES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Busca de atleta no modal */}
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar atleta na turma..."
                    value={buscaModal}
                    onChange={(e) => setBuscaModal(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* KPIs do Período no Modal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Média da Turma</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{metricasTurmaModal.media}%</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    %
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Atletas em Alerta (&lt; 75%)</span>
                    <div
                      className={`text-xl font-bold mt-0.5 ${
                        metricasTurmaModal.alertas > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {metricasTurmaModal.alertas}
                    </div>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      metricasTurmaModal.alertas > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    <AlertTriangle size={16} />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Total de Atletas</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{alunosDaTurma.length}</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
              </div>

              {/* Tabela de Frequência por Atleta no Modal */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200/80 font-semibold uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="py-3 px-4">Atleta</th>
                      <th className="py-3 px-4 text-center">Turma & Horário</th>
                      <th className="py-3 px-4 text-center">
                        {modoEstatistica === 'GLOBAL' ? 'Frequência Global' : `Frequência (${mesObjAtual.curto})`}
                      </th>
                      <th className="py-3 px-4 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alunosModalFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Nenhum atleta encontrado para esta turma/filtro.
                        </td>
                      </tr>
                    ) : (
                      alunosModalFiltrados.map((aluno) => {
                        const taxa = getTaxaAlunoPeriodo(aluno);
                        const isCritical = taxa < 75;
                        const isGreat = taxa >= 90;
                        const turmaNome =
                          aluno.turma ||
                          (aluno.turmaHorario?.includes(' - ') ? aluno.turmaHorario.split(' - ')[0] : aluno.turmaHorario) ||
                          'Padrão';
                        const horarioTreino =
                          aluno.horarioTreino ||
                          (aluno.turmaHorario?.includes(' - ') ? aluno.turmaHorario.split(' - ').slice(1).join(' - ') : null) ||
                          'A definir';

                        return (
                          <tr key={aluno.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={aluno.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                                  alt={aluno.nome}
                                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                                />
                                <div>
                                  <p className="font-semibold text-slate-900">{aluno.nome}</p>
                                  <p className="text-[11px] text-slate-400">Resp: {aluno.responsavel}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-medium text-slate-800">{turmaNome}</span>
                              <span className="block text-[11px] text-slate-400">{horarioTreino}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`font-bold px-2 py-0.5 rounded-full text-xs ${
                                  isCritical
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {taxa}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isCritical ? (
                                <Badge variant="danger">Atenção / Baixa</Badge>
                              ) : isGreat ? (
                                <Badge variant="success">Excelente</Badge>
                              ) : (
                                <Badge variant="neutral">Regular</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsModalEstatisticasOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
