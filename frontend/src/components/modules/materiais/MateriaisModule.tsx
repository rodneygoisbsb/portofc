import React, { useEffect, useState } from 'react';
import {
  Shirt,
  Box,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle,
  PackageCheck,
  Archive,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { materiaisService } from '../../../services/materiaisService';
import { Material, Uniforme } from '../../../types';

export const MateriaisModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'uniformes' | 'materiais'>('uniformes');
  const [uniformes, setUniformes] = useState<Uniforme[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Entrega Uniforme
  const [isEntregaModalOpen, setIsEntregaModalOpen] = useState(false);
  const [selectedUniforme, setSelectedUniforme] = useState<Uniforme | null>(null);
  const [qtdEntrega, setQtdEntrega] = useState(1);

  // Modal Novo Material
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [matForm, setMatForm] = useState({
    nome: '',
    categoria: 'Equipamentos',
    quantidadeEstoque: 10,
    quantidadeMinima: 5,
    localArmazenamento: 'Depósito Central',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uList, mList] = await Promise.all([
        materiaisService.listarUniformes(),
        materiaisService.listarMateriais(),
      ]);
      setUniformes(uList);
      setMateriais(mList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matForm.nome) return;

    await materiaisService.salvarMaterial(matForm);
    setIsMaterialModalOpen(false);
    loadData();
  };

  // KPIs de Uniformes
  const totalComprados = uniformes.reduce((acc, u) => acc + u.quantidadeComprada, 0);
  const totalEntregues = uniformes.reduce((acc, u) => acc + u.quantidadeEntregue, 0);
  const totalSaldoEstoque = uniformes.reduce((acc, u) => acc + u.saldoEstoque, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Materiais & Uniformes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Controle da grade de fardamento dos alunos e equipamentos de treinamento.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'materiais' && (
            <Button variant="emerald" icon={<Plus size={18} />} onClick={() => setIsMaterialModalOpen(true)}>
              Novo Material
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('uniformes')}
          className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'uniformes'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shirt size={17} />
          Grade de Uniformes Oficiais ({uniformes.length} tamanhos)
        </button>
        <button
          onClick={() => setActiveTab('materiais')}
          className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'materiais'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Box size={17} />
          Equipamentos & Materiais Esportivos ({materiais.length})
        </button>
      </div>

      {activeTab === 'uniformes' ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total de Kits Adquiridos
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{totalComprados} uniformes</h3>
              <p className="text-xs text-slate-500 mt-1">Camisa, Calção e Meiões por kit</p>
            </Card>

            <Card>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Entregues aos Alunos
              </span>
              <h3 className="text-2xl font-bold text-blue-700 mt-2">{totalEntregues} kits</h3>
              <p className="text-xs text-slate-500 mt-1">Distribuídos nas turmas ativas</p>
            </Card>

            <Card>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Saldo Disponível em Estoque
              </span>
              <h3 className="text-2xl font-bold text-emerald-700 mt-2">{totalSaldoEstoque} kits</h3>
              <p className="text-xs text-slate-500 mt-1">Prontos para novos matriculados</p>
            </Card>
          </div>

          {/* Grade de Uniformes Table */}
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-4 px-6">Grade / Tamanho</th>
                    <th className="py-4 px-4 text-center">Quantidade Comprada</th>
                    <th className="py-4 px-4 text-center">Entregue aos Atletas</th>
                    <th className="py-4 px-4 text-center">Saldo em Almoxarifado</th>
                    <th className="py-4 px-4">Proporção Entregue</th>
                    <th className="py-4 px-6 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uniformes.map((u) => {
                    const pct = u.quantidadeComprada > 0 ? Math.round((u.quantidadeEntregue / u.quantidadeComprada) * 100) : 0;
                    const isLowStock = u.saldoEstoque <= 5;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900 leading-tight">{u.tamanho}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{u.descricao || 'Kit Oficial PORTO FC'}</p>
                        </td>

                        <td className="py-4 px-4 text-center font-medium text-slate-800">
                          {u.quantidadeComprada} un
                        </td>

                        <td className="py-4 px-4 text-center font-medium text-blue-700">
                          {u.quantidadeEntregue} un
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isLowStock
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.saldoEstoque} un
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-blue-600 h-full rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Send size={13} />}
                            disabled={u.saldoEstoque <= 0}
                            onClick={() => handleOpenEntrega(u)}
                          >
                            Entregar Kit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Materiais Esportivos Table */
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Equipamento / Material</th>
                  <th className="py-4 px-4">Categoria</th>
                  <th className="py-4 px-4 text-center">Estoque Atual</th>
                  <th className="py-4 px-4 text-center">Mínimo Recomendado</th>
                  <th className="py-4 px-6">Local de Armazenamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materiais.map((m) => {
                  const isAbaixoMinimo = m.quantidadeEstoque <= m.quantidadeMinima;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900 leading-tight">{m.nome}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="neutral">{m.categoria}</Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                            isAbaixoMinimo
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {isAbaixoMinimo && <AlertTriangle size={11} />}
                          {m.quantidadeEstoque} unidades
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-xs text-slate-500">
                        {m.quantidadeMinima} unidades
                      </td>
                      <td className="py-4 px-6 text-slate-700 text-xs font-medium">
                        {m.localArmazenamento || 'Armário Principal'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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

      {/* Modal Novo Material */}
      <Modal
        isOpen={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        title="Cadastrar Novo Material Esportivo"
        description="Controle de bolas, coletes, cones e acessórios de treino."
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Categoria</label>
              <input
                type="text"
                value={matForm.categoria}
                onChange={(e) => setMatForm({ ...matForm, categoria: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Local</label>
              <input
                type="text"
                value={matForm.localArmazenamento}
                onChange={(e) => setMatForm({ ...matForm, localArmazenamento: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Quantidade</label>
              <input
                type="number"
                value={matForm.quantidadeEstoque}
                onChange={(e) => setMatForm({ ...matForm, quantidadeEstoque: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Mínimo</label>
              <input
                type="number"
                value={matForm.quantidadeMinima}
                onChange={(e) => setMatForm({ ...matForm, quantidadeMinima: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsMaterialModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              Salvar Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
