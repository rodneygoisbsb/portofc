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
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { EmptyState } from '../../ui/EmptyState';
import { alunosService } from '../../../services/alunosService';
import { Aluno, CategoriaAluno, StatusAluno } from '../../../types';

export const AlunosModule: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '2016-01-01',
    telefone: '',
    responsavel: '',
    categoria: 'SUB_9' as CategoriaAluno,
    turmaHorario: 'Segunda e Quarta - 09:00',
    status: 'ATIVO' as StatusAluno,
    fotoUrl: '',
    observacoesMedicas: '',
  });

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

  const filteredAlunos = useMemo(() => {
    return alunos.filter((aluno) => {
      const matchCat = selectedCategoria === 'TODOS' || aluno.categoria === selectedCategoria;
      const matchSearch =
        searchTerm === '' ||
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [alunos, selectedCategoria, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingAluno(null);
    setFormData({
      nome: '',
      cpf: '',
      dataNascimento: '2015-05-10',
      telefone: '',
      responsavel: '',
      categoria: 'SUB_9',
      turmaHorario: 'Segunda e Quarta - 09:00',
      status: 'ATIVO',
      fotoUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
      observacoesMedicas: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormData({
      nome: aluno.nome,
      cpf: aluno.cpf || '',
      dataNascimento: aluno.dataNascimento,
      telefone: aluno.telefone || '',
      responsavel: aluno.responsavel,
      categoria: aluno.categoria,
      turmaHorario: aluno.turmaHorario || '',
      status: aluno.status,
      fotoUrl: aluno.fotoUrl || '',
      observacoesMedicas: aluno.observacoesMedicas || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.responsavel) {
      alert('Nome e Responsável são obrigatórios.');
      return;
    }

    try {
      await alunosService.salvar({
        ...(editingAluno ? { id: editingAluno.id } : {}),
        ...formData,
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Alunos & Atletas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Controle de matrículas, turmas, frequências e prontuário esportivo.
          </p>
        </div>
        <Button variant="emerald" icon={<Plus size={18} />} onClick={handleOpenCreateModal}>
          Adicionar Aluno
        </Button>
      </div>

      {/* Pill Tabs Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategoria(cat.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategoria === cat.key
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
              description="Nenhum aluno corresponde à categoria ou busca selecionada."
              actionText="Limpar Filtros"
              onAction={() => {
                setSelectedCategoria('TODOS');
                setSearchTerm('');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {selectedIds.length === filteredAlunos.length && filteredAlunos.length > 0 ? (
                        <CheckSquare size={18} className="text-blue-700" />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="py-4 px-4">Aluno</th>
                  <th className="py-4 px-4">Categoria & Turma</th>
                  <th className="py-4 px-4">Responsável & Contato</th>
                  <th className="py-4 px-4 text-center">Frequência</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlunos.map((aluno) => {
                  const isSelected = selectedIds.includes(aluno.id);
                  const freq = aluno.taxaFrequencia ?? 90;
                  const isLowFreq = aluno.alertaFrequenciaBaixa || freq < 75;

                  return (
                    <tr
                      key={aluno.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
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
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={aluno.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={aluno.nome}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{aluno.nome}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {aluno.idade ? `${aluno.idade} anos` : 'Idade calculada'} • CPF: {aluno.cpf || 'Não informado'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="info" className="font-semibold">
                          {aluno.categoria.replace('_', '-')}
                        </Badge>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{aluno.turmaHorario}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-800 font-medium">{aluno.responsavel}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone size={12} />
                          {aluno.telefone || '(61) 98000-0000'}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isLowFreq
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {freq}%
                          </span>
                          {isLowFreq && (
                            <span className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5">
                              <AlertCircle size={10} /> Alerta
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={aluno.status === 'ATIVO' ? 'success' : 'neutral'}>
                          {aluno.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
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

      {/* Modal de Cadastro / Edição */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAluno ? 'Editar Dados do Aluno' : 'Matricular Novo Aluno'}
        description="Preencha os dados cadastrais do atleta para registro na ONG PORTO FC."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAluno} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nome Completo do Aluno *
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Data de Nascimento *
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nome do Responsável *
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Categoria Esportiva *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaAluno })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                <option value="SUB_7">Sub-7 (5 a 7 anos)</option>
                <option value="SUB_9">Sub-9 (8 a 9 anos)</option>
                <option value="SUB_15">Sub-15 (13 a 15 anos)</option>
                <option value="SUB_17">Sub-17 (16 a 17 anos)</option>
                <option value="ADULTO">Adulto (18+ anos)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status da Matrícula
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusAluno })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Turma / Horário de Treino
              </label>
              <input
                type="text"
                value={formData.turmaHorario}
                onChange={(e) => setFormData({ ...formData, turmaHorario: e.target.value })}
                placeholder="Ex: Terça e Quinta - 14:30 às 16:00"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
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
