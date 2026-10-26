import React, { useEffect, useState, useMemo } from 'react';
import {
  Shirt,
  Box,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle,
  PackageCheck,
  Archive,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Landmark,
  ShoppingBag,
  Sparkles,
  Trophy,
  CalendarDays,
  Briefcase,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { materiaisService } from '../../../services/materiaisService';
import { financeiroService } from '../../../services/financeiroService';
import { Material, Uniforme, LancamentoFinanceiro } from '../../../types';
import { GastosCategoriaPanel } from './GastosCategoriaPanel';

type RecursosTab = 'uniformes' | 'materiais' | 'torneios' | 'eventos' | 'administracao';

export const MateriaisModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RecursosTab>('uniformes');
  const [uniformes, setUniformes] = useState<Uniforme[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Entrega Uniforme
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [selectedUniforme, setSelectedUniforme] = useState<Uniforme | null>(null);
  const [qtdEntrega, setQtdEntrega] = useState(1);

  // Modal Uniforme (Criar / Editar)
  const [isUniformeModalOpen, setIsUniformeModalOpen] = useState(false);
  const [editingUniforme, setEditingUniforme] = useState<Uniforme | null>(null);
  const [uniForm, setUniForm] = useState({
    tamanho: '',
    descricao: '',
    quantidadeComprada: 30,
    quantidadeEntregue: 0,
    valorUnitario: '70.00',
  });

  // Modal Material (Criar / Editar)
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [matForm, setMatForm] = useState({
    nome: '',
    categoria: 'Equipamentos',
    quantidadeEstoque: 10,
    quantidadeMinima: 5,
    localArmazenamento: 'Depósito Central',
    valorUnitario: '50.00',
  });

  // Lista dinâmica de categorias para Materiais Esportivos
  const [materialCategorias, setMaterialCategorias] = useState<string[]>(() => {
    const padroes = ['Bolas', 'Coletes', 'Equipamentos', 'Acessórios', 'Saúde & Fisioterapia', 'Treinamento Tático'];
    try {
      const saved = localStorage.getItem('portofc_categorias_materiais');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Erro ao carregar categorias de materiais', e);
    }
    return padroes;
  });

  const [isAddingNovaMatCategoria, setIsAddingNovaMatCategoria] = useState(false);
  const [novaMatCategoriaNome, setNovaMatCategoriaNome] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, mList, lList] = await Promise.all([
        materiaisService.listarUniformes(),
        materiaisService.listarMateriais(),
        financeiroService.listarLancamentos(),
      ]);
      setUniformes(uList);
      setMateriais(mList);
      setLancamentos(lList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // --- CONTROLE DE UNIFORMES ---
  const handleOpenCreateUniforme = () => {
    setEditingUniforme(null);
    setUniForm({
      tamanho: '',
      descricao: 'Kit Camisa, Calção e Meiões',
      quantidadeComprada: 25,
      quantidadeEntregue: 0,
      valorUnitario: '70.00',
    });
    setIsUniformeModalOpen(true);
  };

  const handleOpenEditUniforme = (u: Uniforme) => {
    setEditingUniforme(u);
    setUniForm({
      tamanho: u.tamanho,
      descricao: u.descricao || 'Kit Camisa, Calção e Meiões',
      quantidadeComprada: u.quantidadeComprada,
      quantidadeEntregue: u.quantidadeEntregue,
      valorUnitario: String(u.valorUnitario || 70.0),
    });
    setIsUniformeModalOpen(true);
  };

  const handleSaveUniforme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniForm.tamanho.trim()) {
      alert('Informe o tamanho ou grade do uniforme.');
      return;
    }

    const valorUnit = parseFloat(uniForm.valorUnitario.replace(',', '.')) || 0;
    const qtdComprada = Number(uniForm.quantidadeComprada) || 0;
    const qtdEntregue = Number(uniForm.quantidadeEntregue) || 0;

    await materiaisService.salvarUniforme({
      ...(editingUniforme ? { id: editingUniforme.id } : {}),
      tamanho: uniForm.tamanho.trim(),
      descricao: uniForm.descricao.trim(),
      quantidadeComprada: qtdComprada,
      quantidadeEntregue: qtdEntregue,
      saldoEstoque: Math.max(0, qtdComprada - qtdEntregue),
      valorUnitario: valorUnit,
      valorTotal: Number((valorUnit * qtdComprada).toFixed(2)),
    });

    setIsUniformeModalOpen(false);
    loadData();
  };

  const handleDeleteUniforme = async (id: number) => {
    if (confirm('Deseja excluir esta grade de uniformes?')) {
      await materiaisService.deletarUniforme(id);
      loadData();
    }
  };

  const handleOpenEntrega = (uniforme: Uniforme) => {
    setSelectedUniforme(uniforme);
    setQtdEntrega(1);
    setIsEntregaModalOpen(true);
  };

  const handleConfirmEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniforme) return;

    if (qtdEntrega > selectedUniforme.saldoEstoque) {
      alert('Quantidade excede o saldo disponível em estoque!');
      return;
    }

    await materiaisService.entregarUniforme(selectedUniforme.id, qtdEntrega);
    setIsEntregaModalOpen(false);
    loadData();
  };

  // --- CONTROLE DE MATERIAIS ESPORTIVOS ---
  const handleOpenCreateMaterial = () => {
    setEditingMaterial(null);
    setMatForm({
      nome: '',
      categoria: 'Equipamentos',
      quantidadeEstoque: 10,
      quantidadeMinima: 5,
      localArmazenamento: 'Depósito Central',
      valorUnitario: '50.00',
    });
    setIsMaterialModalOpen(true);
  };

  const handleOpenEditMaterial = (m: Material) => {
    setEditingMaterial(m);
    setMatForm({
      nome: m.nome,
      categoria: m.categoria,
      quantidadeEstoque: m.quantidadeEstoque,
      quantidadeMinima: m.quantidadeMinima,
      localArmazenamento: m.localArmazenamento || 'Depósito Central',
      valorUnitario: String(m.valorUnitario || 50.0),
    });
    setIsMaterialModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matForm.nome.trim()) {
      alert('Informe o nome do material/equipamento.');
      return;
    }

    const valorUnit = parseFloat(matForm.valorUnitario.replace(',', '.')) || 0;
    const qtdEstoque = Number(matForm.quantidadeEstoque) || 0;

    await materiaisService.salvarMaterial({
      ...(editingMaterial ? { id: editingMaterial.id } : {}),
      nome: matForm.nome.trim(),
      categoria: matForm.categoria.trim(),
      quantidadeEstoque: qtdEstoque,
      quantidadeMinima: Number(matForm.quantidadeMinima) || 0,
      localArmazenamento: matForm.localArmazenamento.trim(),
      valorUnitario: valorUnit,
      valorTotal: Number((valorUnit * qtdEstoque).toFixed(2)),
    });

    setIsMaterialModalOpen(false);
    loadData();
  };

  const handleDeleteMaterial = async (id: number) => {
    if (confirm('Deseja excluir este material do almoxarifado?')) {
      await materiaisService.deletarMaterial(id);
      loadData();
    }
  };

  // --- CÁLCULOS ORÇAMENTÁRIOS E SALDOS DE COMPRA (INTEGRADO AO FINANCEIRO) ---
  const orcamentoRubricas = useMemo(() => {
    try {
      const saved = localStorage.getItem('portofc_matriz_rubricas');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      { id: 'UNIFORMES', nome: 'Uniformes e Kits', previsto: 20000, comprometido: 0, realizado: 16500 },
      { id: 'MATERIAIS', nome: 'Materiais Esportivos', previsto: 12000, comprometido: 0, realizado: 5500 },
    ];
  }, []);

  const rubricaUniformes = orcamentoRubricas.find((r: any) => r.id === 'UNIFORMES') || {
    previsto: 20000,
    comprometido: 0,
    realizado: 16500,
  };

  const rubricaMateriais = orcamentoRubricas.find((r: any) => r.id === 'MATERIAIS') || {
    previsto: 12000,
    comprometido: 0,
    realizado: 5500,
  };

  // Saldo restante da rubrica para compras futuras: Previsto - Realizado - Comprometido
  const saldoComprasUniformes = Math.max(0, rubricaUniformes.previsto - rubricaUniformes.realizado - rubricaUniformes.comprometido);
  const saldoComprasMateriais = Math.max(0, rubricaMateriais.previsto - rubricaMateriais.realizado - rubricaMateriais.comprometido);

  // KPIs de Uniformes
  const totalComprados = uniformes.reduce((acc, u) => acc + u.quantidadeComprada, 0);
  const totalEntregues = uniformes.reduce((acc, u) => acc + u.quantidadeEntregue, 0);
  const totalSaldoEstoque = uniformes.reduce((acc, u) => acc + u.saldoEstoque, 0);
  const valorTotalInvestidoUniformes = uniformes.reduce((acc, u) => acc + (u.valorTotal || (u.valorUnitario || 70) * u.quantidadeComprada), 0);
  const valorEstoqueAtualUniformes = uniformes.reduce((acc, u) => acc + (u.saldoEstoque * (u.valorUnitario || 70)), 0);

  // KPIs de Materiais
  const totalItensMateriais = materiais.reduce((acc, m) => acc + m.quantidadeEstoque, 0);
  const valorEstoqueMateriais = materiais.reduce((acc, m) => acc + (m.valorTotal || (m.valorUnitario || 50) * m.quantidadeEstoque), 0);
  const itensAbaixoMinimo = materiais.filter((m) => m.quantidadeEstoque <= m.quantidadeMinima).length;

  const tabs: { id: RecursosTab; label: string; icon: React.ReactNode }[] = [
    { id: 'uniformes', label: `Uniformes (${uniformes.length})`, icon: <Shirt size={17} /> },
    { id: 'materiais', label: `Materiais (${materiais.length})`, icon: <Box size={17} /> },
    { id: 'torneios', label: 'Torneios / Campeonatos', icon: <Trophy size={17} /> },
    { id: 'eventos', label: 'Eventos', icon: <CalendarDays size={17} /> },
    { id: 'administracao', label: 'Administração', icon: <Briefcase size={17} /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recursos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Uniformes, materiais, torneios, eventos e gastos administrativos da ONG em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'uniformes' && (
            <Button variant="emerald" icon={<Plus size={18} />} onClick={handleOpenCreateUniforme}>
              Nova Grade / Tamanho
            </Button>
          )}
          {activeTab === 'materiais' && (
            <Button variant="emerald" icon={<Plus size={18} />} onClick={handleOpenCreateMaterial}>
              Novo Material
            </Button>
          )}
        </div>
      </div>

      {/* Sub-abas de Recursos */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-700 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'torneios' && (
        <GastosCategoriaPanel
          categoria="TORNEIOS"
          titulo="Gastos com Torneios e Campeonatos"
          descricao="Inscrições, transporte, arbitragem, alimentação e demais custos dos campeonatos."
          labelNovo="Novo Gasto de Torneio"
          placeholderDescricao="Ex: Transporte e lanches - Torneio Regional Sub-15"
          icon={Trophy}
          tetoPadrao={10000}
        />
      )}

      {activeTab === 'eventos' && (
        <GastosCategoriaPanel
          categoria="EVENTOS"
          titulo="Gastos com Eventos"
          descricao="Premiações, estrutura, divulgação e custos dos eventos realizados pela ONG."
          labelNovo="Novo Gasto de Evento"
          placeholderDescricao="Ex: Premiação e troféus - Copa da Amizade"
          icon={CalendarDays}
          tetoPadrao={7000}
        />
      )}

      {activeTab === 'administracao' && (
        <GastosCategoriaPanel
          categoria="ADMINISTRATIVO"
          titulo="Gastos Administrativos e Burocracia"
          descricao="Material de escritório, advogados, contabilidade, taxas e demais custos de gestão."
          labelNovo="Novo Gasto Administrativo"
          placeholderDescricao="Ex: Honorários de contabilidade e auditoria fiscal"
          icon={Briefcase}
          tetoPadrao={6000}
        />
      )}

      {activeTab === 'uniformes' && (
        <div className="space-y-6">
          {/* Summary Cards de Uniformes com Valores e Saldo para Compras Futuras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total de Uniformes Adquiridos
                </span>
                <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <Shirt size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{totalComprados} uniformes</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Investimento: <strong className="text-slate-700">{formatBRL(valorTotalInvestidoUniformes)}</strong>
              </p>
            </Card>

            <Card className="p-4 border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Entregues aos Atletas
                </span>
                <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <CheckCircle size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-blue-700 mt-2">{totalEntregues} kits</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {totalComprados > 0 ? Math.round((totalEntregues / totalComprados) * 100) : 0}% distribuídos
              </p>
            </Card>

            <Card className="p-4 border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Saldo em Estoque (Almoxarifado)
                </span>
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <PackageCheck size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-emerald-700 mt-2">{totalSaldoEstoque} kits</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Valor em estoque: <strong className="text-emerald-800">{formatBRL(valorEstoqueAtualUniformes)}</strong>
              </p>
            </Card>

            {/* Saldo de Verba Governamental Para Compras Futuras de Uniformes */}
            <Card className="p-4 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                  Saldo p/ Compras Futuras
                </span>
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <ShoppingBag size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-indigo-900 mt-2">{formatBRL(saldoComprasUniformes)}</h3>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Teto da Rubrica: {formatBRL(rubricaUniformes.previsto)}</span>
                <span className="font-semibold text-emerald-700">Disponível</span>
              </div>
            </Card>
          </div>

          {/* Grade de Uniformes Table com Edição, Preço Unitário e Valor Total */}
          <Card noPadding className="border border-slate-200/80 shadow-xs overflow-hidden rounded-2xl bg-white">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Shirt size={17} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Grade de Tamanhos & Valores Unitários
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tamanhos cadastrados, custo unitário por kit, totais e controle de almoxarifado.
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={handleOpenCreateUniforme}>
                Adicionar Tamanho
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Grade / Tamanho</th>
                    <th className="py-3 px-3 text-right">Valor Unitário</th>
                    <th className="py-3 px-3 text-center">Total Comprado</th>
                    <th className="py-3 px-3 text-right">Valor Total Adquirido</th>
                    <th className="py-3 px-3 text-center">Entregue</th>
                    <th className="py-3 px-3 text-center">Saldo em Estoque</th>
                    <th className="py-3 px-3">Execução Entrega</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {uniformes.map((u) => {
                    const pct = u.quantidadeComprada > 0 ? Math.round((u.quantidadeEntregue / u.quantidadeComprada) * 100) : 0;
                    const isLowStock = u.saldoEstoque <= 5;
                    const vUnit = u.valorUnitario || 70.0;
                    const vTotal = u.valorTotal || vUnit * u.quantidadeComprada;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900 text-xs">{u.tamanho}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{u.descricao || 'Kit Oficial PORTO FC'}</p>
                        </td>

                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {formatBRL(vUnit)}
                        </td>

                        <td className="py-2.5 px-3 text-center font-bold text-slate-800 whitespace-nowrap">
                          {u.quantidadeComprada} un
                        </td>

                        <td className="py-2.5 px-3 text-right font-bold text-blue-700 whitespace-nowrap">
                          {formatBRL(vTotal)}
                        </td>

                        <td className="py-2.5 px-3 text-center font-medium text-slate-600 whitespace-nowrap">
                          {u.quantidadeEntregue} un
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                              isLowStock
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.saldoEstoque} un
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="w-24">
                            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEntrega(u)}
                              disabled={u.saldoEstoque <= 0}
                              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                u.saldoEstoque > 0
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                  : 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed'
                              }`}
                              title="Registrar Entrega de Kit ao Aluno"
                            >
                              <Send size={12} />
                              <span className="hidden sm:inline">Baixa</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditUniforme(u)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                              title="Editar este tamanho / quantidade / valor"
                            >
                              <Edit size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUniforme(u.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                              title="Excluir tamanho"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/90 font-bold text-slate-900 border-t-2 border-slate-200 text-xs">
                    <td className="py-3 px-4 uppercase">Totais Consolidados</td>
                    <td className="py-3 px-3 text-right text-slate-500 font-normal">-</td>
                    <td className="py-3 px-3 text-center font-black">{totalComprados} uniformes</td>
                    <td className="py-3 px-3 text-right font-black text-blue-700">{formatBRL(valorTotalInvestidoUniformes)}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{totalEntregues} un</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md font-black text-emerald-900 bg-emerald-100 border border-emerald-300">
                        {totalSaldoEstoque} kits
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">
                      {totalComprados > 0 ? Math.round((totalEntregues / totalComprados) * 100) : 0}% entregue
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400 font-normal">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'materiais' && (
        /* Materiais Esportivos Tab */
        <div className="space-y-6">
          {/* Summary Cards de Materiais com Totais, Valores e Saldo para Compras Futuras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Total de Itens no Almoxarifado
                </span>
                <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <Box size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-2">{totalItensMateriais} unidades</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{materiais.length} categorias cadastradas</p>
            </Card>

            <Card className="p-4 border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Valor em Patrimônio / Materiais
                </span>
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <DollarSign size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-emerald-700 mt-2">{formatBRL(valorEstoqueMateriais)}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Soma dos valores em almoxarifado</p>
            </Card>

            <Card className="p-4 border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Itens Abaixo do Mínimo
                </span>
                <span className="p-1.5 bg-rose-50 text-rose-700 rounded-lg">
                  <AlertTriangle size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-rose-700 mt-2">{itensAbaixoMinimo} alertas</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Necessitam reposição imediata</p>
            </Card>

            {/* Saldo de Verba Governamental Para Compras Futuras de Materiais */}
            <Card className="p-4 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                  Saldo p/ Compras Futuras
                </span>
                <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
                  <ShoppingBag size={15} />
                </span>
              </div>
              <h3 className="text-xl font-bold text-indigo-900 mt-2">{formatBRL(saldoComprasMateriais)}</h3>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>Teto da Rubrica: {formatBRL(rubricaMateriais.previsto)}</span>
                <span className="font-semibold text-emerald-700">Disponível</span>
              </div>
            </Card>
          </div>

          {/* Materiais Esportivos Table com Edição e Exclusão */}
          <Card noPadding className="border border-slate-200/80 shadow-xs overflow-hidden rounded-2xl bg-white">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                  <Box size={17} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Almoxarifado de Equipamentos & Treinamento
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bolas, cones, coletes, equipamentos e acessórios com controle de valores.
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={handleOpenCreateMaterial}>
                Novo Material
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Equipamento / Material</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3 text-right">Valor Unitário</th>
                    <th className="py-3 px-3 text-center">Estoque Atual</th>
                    <th className="py-3 px-3 text-right">Valor Total em Estoque</th>
                    <th className="py-3 px-3 text-center">Estoque Mínimo</th>
                    <th className="py-3 px-4">Local de Armazenamento</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {materiais.map((m) => {
                    const isAbaixoMinimo = m.quantidadeEstoque <= m.quantidadeMinima;
                    const vUnit = m.valorUnitario || 50.0;
                    const vTotal = m.valorTotal || vUnit * m.quantidadeEstoque;

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900 text-xs">{m.nome}</p>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge variant="neutral">{m.categoria}</Badge>
                        </td>

                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800 whitespace-nowrap">
                          {formatBRL(vUnit)}
                        </td>

                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                              isAbaixoMinimo
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {isAbaixoMinimo && <AlertTriangle size={11} />}
                            {m.quantidadeEstoque} un
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                          {formatBRL(vTotal)}
                        </td>

                        <td className="py-2.5 px-3 text-center text-xs text-slate-500 whitespace-nowrap">
                          {m.quantidadeMinima} un
                        </td>

                        <td className="py-2.5 px-4 text-slate-700 text-xs font-medium whitespace-nowrap">
                          {m.localArmazenamento || 'Armário Principal'}
                        </td>

                        <td className="py-2.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMaterial(m)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                              title="Editar este material"
                            >
                              <Edit size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(m.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                              title="Excluir material"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/90 font-bold text-slate-900 border-t-2 border-slate-200 text-xs">
                    <td className="py-3 px-4 uppercase">Total do Almoxarifado</td>
                    <td className="py-3 px-3 text-slate-500 font-normal">-</td>
                    <td className="py-3 px-3 text-right text-slate-500 font-normal">-</td>
                    <td className="py-3 px-3 text-center font-black text-slate-900">{totalItensMateriais} unidades</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-700">{formatBRL(valorEstoqueMateriais)}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-normal">-</td>
                    <td className="py-3 px-4 text-slate-400 font-normal">-</td>
                    <td className="py-3 px-4 text-center text-slate-400 font-normal">-</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Criar / Editar Grade de Uniforme */}
      <Modal
        isOpen={isUniformeModalOpen}
        onClose={() => setIsUniformeModalOpen(false)}
        title={editingUniforme ? 'Editar Grade de Uniforme' : 'Cadastrar Nova Grade / Tamanho'}
        description="Defina o tamanho, descrição do kit, quantidades adquiridas e custo unitário."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUniforme} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Grade / Tamanho *
              </label>
              <input
                type="text"
                required
                value={uniForm.tamanho}
                onChange={(e) => setUniForm({ ...uniForm, tamanho: e.target.value })}
                placeholder="Ex: Tam 8 (Sub-9) ou M (Adulto)"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Custo Unitário (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={uniForm.valorUnitario}
                onChange={(e) => setUniForm({ ...uniForm, valorUnitario: e.target.value })}
                placeholder="Ex: 70.00"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Descrição do Kit
              </label>
              <input
                type="text"
                value={uniForm.descricao}
                onChange={(e) => setUniForm({ ...uniForm, descricao: e.target.value })}
                placeholder="Ex: Kit Camisa, Calção e Meiões"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Quantidade Total Comprada *
              </label>
              <input
                type="number"
                min="1"
                required
                value={uniForm.quantidadeComprada}
                onChange={(e) => setUniForm({ ...uniForm, quantidadeComprada: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Quantidade Entregue aos Atletas
              </label>
              <input
                type="number"
                min="0"
                max={uniForm.quantidadeComprada}
                value={uniForm.quantidadeEntregue}
                onChange={(e) => setUniForm({ ...uniForm, quantidadeEntregue: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Prévia do Valor Total Calculado */}
          {(() => {
            const vUnit = parseFloat(uniForm.valorUnitario.replace(',', '.')) || 0;
            const qtd = Number(uniForm.quantidadeComprada) || 0;
            const total = vUnit * qtd;
            const saldoEstoque = Math.max(0, qtd - (Number(uniForm.quantidadeEntregue) || 0));

            return (
              <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Saldo em estoque: <strong>{saldoEstoque} kits</strong></span>
                  <span className="text-slate-500">Valor total do lote adquirido:</span>
                </div>
                <span className="text-base font-bold text-blue-900">{formatBRL(total)}</span>
              </div>
            );
          })()}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsUniformeModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              {editingUniforme ? 'Salvar Alterações' : 'Cadastrar Tamanho'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Entrega de Uniforme */}
      <Modal
        isOpen={isEntregaModalOpen}
        onClose={() => setIsEntregaModalOpen(false)}
        title="Registrar Entrega de Uniforme"
        description={`Baixa no estoque do tamanho ${selectedUniforme?.tamanho}.`}
      >
        <form onSubmit={handleConfirmEntrega} className="space-y-4">
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
            Saldo Atual em Estoque: <strong>{selectedUniforme?.saldoEstoque} unidades</strong>.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Quantidade a ser Entregue *
            </label>
            <input
              type="number"
              min={1}
              max={selectedUniforme?.saldoEstoque || 1}
              value={qtdEntrega}
              onChange={(e) => setQtdEntrega(parseInt(e.target.value) || 1)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsEntregaModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              Confirmar Entrega
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Criar / Editar Material */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title={editingMaterial ? 'Editar Material Esportivo' : 'Cadastrar Novo Material Esportivo'}
        description="Controle de bolas, coletes, cones e acessórios de treino."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome do Item *</label>
            <input
              type="text"
              required
              value={matForm.nome}
              onChange={(e) => setMatForm({ ...matForm, nome: e.target.value })}
              placeholder="Ex: Barreira Móvel de Treino"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Categoria *
                </label>
                {isAddingNovaMatCategoria ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNovaMatCategoria(false);
                      setNovaMatCategoriaNome('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
                  >
                    Cancelar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddingNovaMatCategoria(true)}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus size={12} /> Nova
                  </button>
                )}
              </div>

              {isAddingNovaMatCategoria ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-200">
                  <input
                    type="text"
                    autoFocus
                    value={novaMatCategoriaNome}
                    onChange={(e) => setNovaMatCategoriaNome(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const nomeTrim = novaMatCategoriaNome.trim();
                        if (nomeTrim) {
                          if (!materialCategorias.includes(nomeTrim)) {
                            const updated = [...materialCategorias, nomeTrim];
                            setMaterialCategorias(updated);
                            try {
                              localStorage.setItem('portofc_categorias_materiais', JSON.stringify(updated));
                            } catch (err) {
                              console.warn(err);
                            }
                          }
                          setMatForm({ ...matForm, categoria: nomeTrim });
                          setIsAddingNovaMatCategoria(false);
                          setNovaMatCategoriaNome('');
                        }
                      } else if (e.key === 'Escape') {
                        setIsAddingNovaMatCategoria(false);
                        setNovaMatCategoriaNome('');
                      }
                    }}
                    placeholder="Nome da categoria..."
                    className="flex-1 px-3 py-2 text-sm bg-white border border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-600/30 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nomeTrim = novaMatCategoriaNome.trim();
                      if (nomeTrim) {
                        if (!materialCategorias.includes(nomeTrim)) {
                          const updated = [...materialCategorias, nomeTrim];
                          setMaterialCategorias(updated);
                          try {
                            localStorage.setItem('portofc_categorias_materiais', JSON.stringify(updated));
                          } catch (err) {
                            console.warn(err);
                          }
                        }
                        setMatForm({ ...matForm, categoria: nomeTrim });
                        setIsAddingNovaMatCategoria(false);
                        setNovaMatCategoriaNome('');
                      }
                    }}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <select
                  value={matForm.categoria}
                  onChange={(e) => setMatForm({ ...matForm, categoria: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-slate-700 cursor-pointer"
                >
                  {materialCategorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  {/* Garante que categoria atual apareça se não estiver na lista padrão */}
                  {matForm.categoria && !materialCategorias.includes(matForm.categoria) && (
                    <option value={matForm.categoria}>{matForm.categoria}</option>
                  )}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Custo Unitário (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={matForm.valorUnitario}
                onChange={(e) => setMatForm({ ...matForm, valorUnitario: e.target.value })}
                placeholder="Ex: 120.00"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Estoque Atual</label>
              <input
                type="number"
                min="0"
                value={matForm.quantidadeEstoque}
                onChange={(e) => setMatForm({ ...matForm, quantidadeEstoque: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={matForm.quantidadeMinima}
                onChange={(e) => setMatForm({ ...matForm, quantidadeMinima: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Local Armazenado</label>
              <input
                type="text"
                value={matForm.localArmazenamento}
                onChange={(e) => setMatForm({ ...matForm, localArmazenamento: e.target.value })}
                placeholder="Ex: Armário A1"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Resumo do Valor Total do Material */}
          {(() => {
            const vUnit = parseFloat(matForm.valorUnitario.replace(',', '.')) || 0;
            const qtd = Number(matForm.quantidadeEstoque) || 0;
            const total = vUnit * qtd;

            return (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600">Valor em estoque deste material:</span>
                <span className="text-base font-bold text-emerald-800">{formatBRL(total)}</span>
              </div>
            );
          })()}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsMaterialModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              {editingMaterial ? 'Salvar Alterações' : 'Salvar Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

