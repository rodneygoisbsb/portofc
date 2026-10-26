import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit,
  Phone,
  UserCheck,
  Calendar,
  CheckSquare,
  Square,
  Cake,
  Clock,
  Upload,
  PartyPopper,
  User,
  X,
  Eye,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { EmptyState } from '../../ui/EmptyState';
import { alunosService } from '../../../services/alunosService';
import { Aluno, CategoriaAluno, StatusAluno } from '../../../types';

export const OPCOES_TURMAS = [
  'Terça e Quinta',
  'Segunda e Quarta',
  'Sábado (Manhã)',
  'Sábado (Tarde)',
  'Turma A',
  'Turma B',
  'Turma Única',
  'Turma Noturna',
];

export const OPCOES_HORARIOS = [
  '08:30 às 09:30',
  '09:00 às 10:15',
  '10:00 às 11:00',
  '14:30 às 16:00',
  '16:00 às 17:30',
  '19:30 às 21:00',
];

export const AlunosModule: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterOnlyBirthdays, setFilterOnlyBirthdays] = useState(false);

  // Modal State de Edição / Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '2016-01-01',
    telefone: '',
    responsavel: '',
    categoria: 'SUB_9' as CategoriaAluno,
    turma: 'Turma A',
    horarioTreino: '09:00 às 10:15',
    status: 'ATIVO' as StatusAluno,
    fotoUrl: '',
    observacoesMedicas: '',
  });

  // Modal State de Visualização (Somente Leitura)
  const [viewingAluno, setViewingAluno] = useState<Aluno | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const categories: { key: string; label: string }[] = [
    { key: 'TODOS', label: 'Todos os Alunos' },
    { key: 'SUB_7', label: 'Sub-7' },
    { key: 'SUB_9', label: 'Sub-9' },
    { key: 'SUB_15', label: 'Sub-15' },
    { key: 'SUB_17', label: 'Sub-17' },
    { key: 'ADULTO', label: 'Adulto' },
  ];

  useEffect(() => {
    loadAlunos();
  }, []);

  const loadAlunos = async () => {
    try {
      setLoading(true);
      const data = await alunosService.listar();
      setAlunos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de dias até o próximo aniversário (aviso com até 5 dias de antecedência)
  const getAniversarioInfo = (dataNascStr?: string) => {
    if (!dataNascStr) return null;
    const parts = dataNascStr.split('-');
    if (parts.length < 3) return null;
    const mes = parseInt(parts[1], 10) - 1;
    const dia = parseInt(parts[2], 10);

    const hoje = new Date();
    const hojeZerado = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    let anivEsteAno = new Date(hoje.getFullYear(), mes, dia);
    if (anivEsteAno.getTime() < hojeZerado.getTime()) {
      anivEsteAno = new Date(hoje.getFullYear() + 1, mes, dia);
    }

    const diffMs = anivEsteAno.getTime() - hojeZerado.getTime();
    const diasFaltantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

    const diaFmt = String(dia).padStart(2, '0');
    const mesFmt = String(mes + 1).padStart(2, '0');
    const dataTexto = `${diaFmt}/${mesFmt}`;

    const isHoje = diasFaltantes === 0;
    const isPerto = diasFaltantes <= 5;

    let mensagem = '';
    if (isHoje) {
      mensagem = 'Aniversariante do Dia';
    } else if (diasFaltantes === 1) {
      mensagem = `Aniversário Amanhã`;
    } else if (diasFaltantes <= 5) {
      mensagem = `Aniversário em ${diasFaltantes} dias`;
    } else {
      mensagem = `${dataTexto}`;
    }

    return {
      diasFaltantes,
      dataTexto,
      isHoje,
      isPerto,
      mensagem,
    };
  };

  const aniversariantesProximos = useMemo(() => {
    return alunos
      .filter((aluno) => {
        const info = getAniversarioInfo(aluno.dataNascimento);
        return info && info.isPerto;
      })
      .sort((a, b) => {
        const infoA = getAniversarioInfo(a.dataNascimento);
        const infoB = getAniversarioInfo(b.dataNascimento);
        return (infoA?.diasFaltantes ?? 999) - (infoB?.diasFaltantes ?? 999);
      });
  }, [alunos]);

  const filteredAlunos = useMemo(() => {
    return alunos.filter((aluno) => {
      const matchCat = selectedCategoria === 'TODOS' || aluno.categoria === selectedCategoria;
      const matchSearch =
        searchTerm === '' ||
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchBirthday = !filterOnlyBirthdays || getAniversarioInfo(aluno.dataNascimento)?.isPerto;
      return matchCat && matchSearch && matchBirthday;
    });
  }, [alunos, selectedCategoria, searchTerm, filterOnlyBirthdays]);

  const listaTurmasDisponiveis = useMemo(() => {
    if (formData.turma && !OPCOES_TURMAS.includes(formData.turma)) {
      return [formData.turma, ...OPCOES_TURMAS];
    }
    return OPCOES_TURMAS;
  }, [formData.turma]);

  const listaHorariosDisponiveis = useMemo(() => {
    if (formData.horarioTreino && !OPCOES_HORARIOS.includes(formData.horarioTreino)) {
      return [formData.horarioTreino, ...OPCOES_HORARIOS];
    }
    return OPCOES_HORARIOS;
  }, [formData.horarioTreino]);

  const handleOpenCreateModal = () => {
    setEditingAluno(null);
    setFormData({
      nome: '',
      cpf: '',
      dataNascimento: '2015-05-10',
      telefone: '',
      responsavel: '',
      categoria: 'SUB_9',
      turma: 'Terça e Quinta',
      horarioTreino: '08:30 às 09:30',
      status: 'ATIVO',
      fotoUrl: '',
      observacoesMedicas: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (aluno: Aluno) => {
    setEditingAluno(aluno);
    let parsedTurma = aluno.turma || '';
    let parsedHorario = aluno.horarioTreino || '';
    if (!parsedTurma && aluno.turmaHorario) {
      if (aluno.turmaHorario.includes(' - ')) {
        const parts = aluno.turmaHorario.split(' - ');
        parsedTurma = parts[0]?.trim();
        parsedHorario = parts.slice(1).join(' - ')?.trim();
      } else {
        parsedTurma = aluno.turmaHorario;
      }
    }

    setFormData({
      nome: aluno.nome,
      cpf: aluno.cpf || '',
      dataNascimento: aluno.dataNascimento,
      telefone: aluno.telefone || '',
      responsavel: aluno.responsavel,
      categoria: aluno.categoria,
      turma: parsedTurma || 'Turma A',
      horarioTreino: parsedHorario || '09:00 às 10:15',
      status: aluno.status,
      fotoUrl: aluno.fotoUrl || '',
      observacoesMedicas: aluno.observacoesMedicas || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (aluno: Aluno) => {
    setViewingAluno(aluno);
    setIsViewModalOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, fotoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.responsavel) {
      alert('Nome e Responsável são obrigatórios.');
      return;
    }

    const turmaFinal = formData.turma.trim();
    const horarioFinal = formData.horarioTreino.trim();
    const turmaHorarioComposto = turmaFinal && horarioFinal ? `${turmaFinal} - ${horarioFinal}` : (turmaFinal || horarioFinal);

    try {
      await alunosService.salvar({
        ...(editingAluno ? { id: editingAluno.id } : {}),
        ...formData,
        turma: turmaFinal,
        horarioTreino: horarioFinal,
        turmaHorario: turmaHorarioComposto,
      });
      setIsModalOpen(false);
      loadAlunos();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteAluno = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir a matrícula deste aluno?')) {
      await alunosService.deletar(id);
      loadAlunos();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAlunos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlunos.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Alunos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Controle de matrículas, turmas, frequências e prontuário esportivo.
          </p>
        </div>
        <Button variant="emerald" icon={<Plus size={18} />} onClick={handleOpenCreateModal}>
          Adicionar Aluno
        </Button>
      </div>

      {/* Alerta de Aniversários Próximos (Até 5 dias de antecedência - sem exibir lista de nomes) */}
      {aniversariantesProximos.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-orange-400/10 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
              <Cake size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                Aniversários Próximos ({aniversariantesProximos.length} {aniversariantesProximos.length === 1 ? 'aluno' : 'alunos'})
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 border border-amber-200 px-2 py-0.5 rounded-full">
                  Próximos 5 dias
                </span>
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Há atletas fazendo aniversário nos próximos 5 dias. Utilize o filtro ao lado para identificá-los na lista.
              </p>
            </div>
          </div>
          <button
            onClick={() => setFilterOnlyBirthdays(!filterOnlyBirthdays)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-xs ${filterOnlyBirthdays
              ? 'bg-amber-600 text-white'
              : 'bg-white text-amber-900 border border-amber-300 hover:bg-amber-50'
              }`}
          >
            {filterOnlyBirthdays ? 'Exibir Todos os Alunos' : 'Filtrar Apenas Aniversariantes'}
          </button>
        </div>
      )}

      {/* Pill Tabs Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategoria(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${selectedCategoria === cat.key
              ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou responsável..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs text-slate-500">
            {filterOnlyBirthdays && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                <Cake size={13} className="text-amber-600" />
                Filtrando Aniversariantes (5 dias)
                <button
                  onClick={() => setFilterOnlyBirthdays(false)}
                  className="hover:text-amber-950 font-bold ml-1 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            <span>
              Exibindo <strong>{filteredAlunos.length}</strong> de <strong>{alunos.length}</strong> alunos
            </span>
          </div>
        </div>

        {/* Batch Action Bar if items selected */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50/80 border-b border-blue-100 px-6 py-3 flex items-center justify-between text-xs text-blue-900 animate-in fade-in">
            <span className="font-semibold">
              {selectedIds.length} {selectedIds.length === 1 ? 'aluno selecionado' : 'alunos selecionados'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  alert(`Ação em lote disparada para ${selectedIds.length} alunos.`);
                  setSelectedIds([]);
                }}
                className="px-3 py-1.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Exportar Fichas
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {filteredAlunos.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Nenhum aluno encontrado"
              description="Nenhum aluno corresponde à categoria, busca ou filtro selecionado."
              actionText="Limpar Filtros"
              onAction={() => {
                setSelectedCategoria('TODOS');
                setSearchTerm('');
                setFilterOnlyBirthdays(false);
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm text-slate-600">
              <colgroup>
                <col style={{ width: '48px' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th style={{ width: '48px' }} className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={toggleSelectAll}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Selecionar todos"
                      >
                        {selectedIds.length === filteredAlunos.length && filteredAlunos.length > 0 ? (
                          <CheckSquare size={18} className="text-blue-700" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </div>
                  </th>
                  <th style={{ width: '28%' }} className="py-4 px-4 text-left">
                    <span>Aluno</span>
                  </th>
                  <th style={{ width: '12%' }} className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center w-full text-center">
                      <span>Categoria</span>
                    </div>
                  </th>
                  <th style={{ width: '12%' }} className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center w-full text-center">
                      <span>Turma</span>
                    </div>
                  </th>
                  <th style={{ width: '12%' }} className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center w-full text-center">
                      <span>Horário</span>
                    </div>
                  </th>
                  <th style={{ width: '12%' }} className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center w-full text-center">
                      <span>Frequência</span>
                    </div>
                  </th>
                  <th style={{ width: '12%' }} className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center w-full text-center">
                      <span>Status</span>
                    </div>
                  </th>
                  <th style={{ width: '12%' }} className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center w-full text-center">
                      <span>Ações</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlunos.map((aluno) => {
                  const isSelected = selectedIds.includes(aluno.id);
                  const freq = aluno.taxaFrequencia ?? 90;
                  const isLowFreq = aluno.alertaFrequenciaBaixa || freq < 75;
                  const anivInfo = getAniversarioInfo(aluno.dataNascimento);

                  // Resolução de Turma e Horário
                  const turmaExibicao = aluno.turma || (aluno.turmaHorario && aluno.turmaHorario.includes(' - ') ? aluno.turmaHorario.split(' - ')[0] : aluno.turmaHorario);
                  const horarioExibicao = aluno.horarioTreino || (aluno.turmaHorario && aluno.turmaHorario.includes(' - ') ? aluno.turmaHorario.split(' - ').slice(1).join(' - ') : null);

                  return (
                    <tr
                      key={aluno.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td style={{ width: '48px' }} className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => toggleSelectOne(aluno.id)}
                            className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={18} className="text-blue-700" />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Coluna Aluno: Foto, Nome e Tag de Aniversário SEMPRE ABAIXO DO NOME */}
                      <td style={{ width: '28%' }} className="py-4 px-4 text-left">
                        <div className="flex items-center gap-3">
                          <img
                            src={aluno.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={aluno.nome}
                            onClick={() => handleOpenViewModal(aluno)}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                            title="Clique para visualizar informações do aluno"
                          />
                          <div className="min-w-0 flex flex-col items-start gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenViewModal(aluno)}
                              className="font-semibold text-slate-900 hover:text-blue-700 transition-colors cursor-pointer text-left leading-tight"
                            >
                              {aluno.nome}
                            </button>
                            {anivInfo?.isPerto && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                                  anivInfo.isHoje
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                                title={`Aniversário: ${anivInfo.dataTexto}`}
                              >
                                <Cake size={11} className="text-amber-600 shrink-0" />
                                <span>{anivInfo.mensagem}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Coluna Categoria: 12% e Rigorosamente Centralizada */}
                      <td style={{ width: '12%' }} className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center w-full text-center">
                          <Badge variant="info" className="font-semibold text-xs">
                            {aluno.categoria.replace('_', '-')}
                          </Badge>
                        </div>
                      </td>

                      {/* Coluna Turma: 12% e Rigorosamente Centralizada */}
                      <td style={{ width: '12%' }} className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center w-full text-center">
                          <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">
                            {turmaExibicao || 'Turma não informada'}
                          </span>
                        </div>
                      </td>

                      {/* Coluna Horário: 12% e Rigorosamente Centralizada */}
                      <td style={{ width: '12%' }} className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center w-full text-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap">
                          <Clock size={13} className="text-slate-400 shrink-0" />
                          <span>{horarioExibicao || 'Horário a definir'}</span>
                        </div>
                      </td>

                      {/* Coluna Frequência: 12% e Rigorosamente Centralizada */}
                      <td style={{ width: '12%' }} className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center w-full text-center">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isLowFreq
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {freq}%
                          </span>
                        </div>
                      </td>

                      {/* Coluna Status: 12% e Rigorosamente Centralizada */}
                      <td style={{ width: '12%' }} className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center w-full text-center">
                          <Badge variant={aluno.status === 'ATIVO' ? 'success' : 'neutral'}>
                            {aluno.status}
                          </Badge>
                        </div>
                      </td>

                      {/* Coluna Ações: 12% e Rigorosamente Centralizada */}
                      <td style={{ width: '12%' }} className="py-4 px-2 text-center">
                        <div className="flex items-center justify-center w-full text-center gap-1">
                          <button
                            onClick={() => handleOpenViewModal(aluno)}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Visualizar Informações do Aluno"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(aluno)}
                            className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Aluno"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAluno(aluno.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remover Matrícula"
                          >
                            <Trash2 size={16} />
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

      {/* Modal de Informações do Aluno (Somente Leitura) */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Informações do Aluno"
        description="Ficha cadastral oficial do atleta (modo somente leitura)."
        maxWidth="lg"
      >
        {viewingAluno && (
          <div className="space-y-6">
            {/* Cabeçalho do Aluno */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <img
                src={viewingAluno.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={viewingAluno.nome}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-600/20 shadow-sm shrink-0"
              />
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{viewingAluno.nome}</h3>
                  <Badge variant={viewingAluno.status === 'ATIVO' ? 'success' : 'neutral'}>
                    {viewingAluno.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Atleta matriculado no projeto social da ONG PORTO FC
                </p>
                {(() => {
                  const aniv = getAniversarioInfo(viewingAluno.dataNascimento);
                  if (aniv?.isPerto) {
                    return (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <Cake size={13} className="text-amber-600" />
                        {aniv.mensagem} (Nasc: {aniv.dataTexto})
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Informações Obrigatórias Somente Leitura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nome do Aluno
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-1 select-all">
                  {viewingAluno.nome}
                </p>
              </div>

              {/* CPF */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  CPF
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-1 select-all">
                  {viewingAluno.cpf || 'Não informado'}
                </p>
              </div>

              {/* Data de Nascimento */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Data de Nascimento
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-2">
                  <span>
                    {viewingAluno.dataNascimento
                      ? viewingAluno.dataNascimento.split('-').reverse().join('/')
                      : 'Não informada'}
                  </span>
                  {viewingAluno.idade && (
                    <span className="text-xs text-slate-500 font-normal">
                      ({viewingAluno.idade} anos)
                    </span>
                  )}
                </p>
              </div>

              {/* Categoria */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Categoria
                </span>
                <div className="mt-1">
                  <Badge variant="info" className="font-semibold text-xs">
                    {viewingAluno.categoria.replace('_', '-')}
                  </Badge>
                </div>
              </div>

              {/* Turma e Horário de Treino */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 sm:col-span-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Turma e Horário
                </span>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">
                    {viewingAluno.turma || (viewingAluno.turmaHorario && viewingAluno.turmaHorario.includes(' - ') ? viewingAluno.turmaHorario.split(' - ')[0] : viewingAluno.turmaHorario) || 'Turma não atribuída'}
                  </span>
                  <span className="text-xs text-slate-600 flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                    <Clock size={13} className="text-blue-600 shrink-0" />
                    {viewingAluno.horarioTreino || (viewingAluno.turmaHorario && viewingAluno.turmaHorario.includes(' - ') ? viewingAluno.turmaHorario.split(' - ').slice(1).join(' - ') : null) || 'Horário a definir'}
                  </span>
                </div>
              </div>

              {/* Responsável */}
              <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 sm:col-span-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Responsável
                </span>
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{viewingAluno.responsavel}</p>
                  {viewingAluno.telefone && (
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-medium bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      <Phone size={12} className="text-slate-400" />
                      {viewingAluno.telefone}
                    </p>
                  )}
                </div>
              </div>

              {/* Observações Médicas (se houver) */}
              {viewingAluno.observacoesMedicas && (
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 sm:col-span-2">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                    Observações Médicas ou Alergias
                  </span>
                  <p className="text-xs text-amber-950 mt-1 leading-relaxed">
                    {viewingAluno.observacoesMedicas}
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé com Fechar e Atalho para Edição */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => {
                  const aluno = viewingAluno;
                  setIsViewModalOpen(false);
                  handleOpenEditModal(aluno);
                }}
                icon={<Edit size={16} />}
              >
                Editar Aluno
              </Button>
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Cadastro / Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAluno ? 'Editar Dados do Aluno' : 'Matricular Novo Aluno'}
        description="Preencha os dados cadastrais do atleta para registro na ONG PORTO FC."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAluno} className="space-y-4">
          {/* Seção da Foto do Aluno */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group shrink-0">
              {formData.fotoUrl ? (
                <img
                  src={formData.fotoUrl}
                  alt="Foto do Aluno"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-600/30 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-200 text-slate-400 flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                  <User size={30} />
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5">Sem foto</span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Foto do Aluno / Atleta
                </span>
                {formData.fotoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, fotoUrl: '' })}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Remover foto
                  </button>
                )}
              </div>
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
                value={formData.fotoUrl}
                onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                placeholder="https://exemplo.com/foto-do-aluno.jpg"
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nome Completo do Aluno <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Gabriel Santos Silva"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                CPF do Aluno
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Data de Nascimento <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dataNascimento}
                onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Nome do Responsável <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                placeholder="Ex: Joana dos Santos (Mãe)"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                placeholder="(61) 98888-7777"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Categoria Esportiva <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaAluno })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
              >
                <option value="SUB_7">Sub-7 (5 a 7 anos)</option>
                <option value="SUB_9">Sub-9 (8 a 9 anos)</option>
                <option value="SUB_15">Sub-15 (13 a 15 anos)</option>
                <option value="SUB_17">Sub-17 (16 a 17 anos)</option>
                <option value="ADULTO">Adulto (18+ anos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Status da Matrícula
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusAluno })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            {/* Turma Pré-definida */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Turma <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.turma}
                onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700 cursor-pointer"
              >
                <option value="">Selecione a turma...</option>
                {listaTurmasDisponiveis.map((turma) => (
                  <option key={turma} value={turma}>
                    {turma}
                  </option>
                ))}
              </select>
            </div>

            {/* Horário de Treino Pré-definido */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Horário de Treino <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.horarioTreino}
                onChange={(e) => setFormData({ ...formData, horarioTreino: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700 cursor-pointer"
              >
                <option value="">Selecione o horário...</option>
                {listaHorariosDisponiveis.map((horario) => (
                  <option key={horario} value={horario}>
                    {horario}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1.5">
                Observações Médicas ou Alergias
              </label>
              <textarea
                rows={2}
                value={formData.observacoesMedicas}
                onChange={(e) => setFormData({ ...formData, observacoesMedicas: e.target.value })}
                placeholder="Restrições, medicamentos ou cuidados especiais..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              {editingAluno ? 'Salvar Alterações' : 'Confirmar Matrícula'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
