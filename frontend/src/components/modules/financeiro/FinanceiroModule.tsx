import React, { useEffect, useState, useMemo } from 'react';
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

export const FinanceiroModule: React.FC = () => {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [orcamentos, setOrcamentos] = useState<OrcamentoMes[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: 'SAIDA' as TipoLancamento,
    descricao: '',
    categoria: 'MATERIAIS',
    valor: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    dataPagamento: '',
    formaPagamento: 'PIX' as FormaPagamento,
    status: 'PAGO' as StatusFinanceiro,
    comprovanteUrl: '',
  });

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

  const handleSaveLancamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || form.valor <= 0) {
      alert('Descrição e valor válido são obrigatórios.');
      return;
    }

    await financeiroService.salvarLancamento({
      ...form,
      dataPagamento: form.status === 'PAGO' ? form.dataPagamento || form.dataVencimento : undefined,
    });
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteLancamento = async (id: number) => {
    if (confirm('Deseja excluir este lançamento financeiro?')) {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financeiro</h2>
          <p className="text-sm text-slate-500 mt-1">
            Lançamento de receitas e despesas, controle orçamentário e comprovantes.
          </p>
        </div>
        <Button variant="emerald" icon={<Plus size={18} />} onClick={() => setIsModalOpen(true)}>
          Novo Lançamento
        </Button>
      </div>

      {/* KPI Cards Row */}
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

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Saldo Operacional</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-blue-700 mt-2">{formatBRL(saldoReal)}</h3>
          <p className="text-xs text-slate-400 mt-1">Balanço consolidado do projeto</p>
        </Card>
      </div>

      {/* Orçamento Mensal Confrontando Previsto x Realizado */}
      <Card>
        <h4 className="font-bold text-slate-900 mb-4">Acompanhamento Orçamentário Trimestral</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {orcamentos.map((orc) => {
            const pct = orc.previsto > 0 ? Math.round((orc.realizado / orc.previsto) * 100) : 0;
            return (
              <div key={orc.mesReferencia} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">Mês: {orc.mesReferencia}</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                    {pct}% executado
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full ${pct > 90 ? 'bg-amber-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 text-xs text-slate-500 gap-1">
                  <div>Previsto: <strong className="text-slate-800">{formatBRL(orc.previsto)}</strong></div>
                  <div>Gasto: <strong className="text-slate-800">{formatBRL(orc.realizado)}</strong></div>
                  <div className="col-span-2 text-emerald-600 font-semibold mt-1">
                    Economia/Saldo: {formatBRL(orc.diferenca)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Lançamentos Table Card */}
      <Card noPadding>
        {/* Filter controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['TODOS', 'ENTRADA', 'SAIDA'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                  filtroTipo === tipo
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tipo === 'TODOS' ? 'Todos os Tipos' : tipo === 'ENTRADA' ? 'Entradas (+)' : 'Saídas (-)'}
              </button>
            ))}

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700"
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
            placeholder="Buscar por descrição..."
            className="w-full sm:w-64 text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
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
                  <th className="py-4 px-6 text-right">Ações</th>
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
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <FileText size={11} /> Comprovante anexado
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <Badge variant="neutral">{item.categoria}</Badge>
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

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteLancamento(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover Lançamento"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Novo Lançamento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Lançamento Financeiro"
        description="Registre uma receita ou despesa no livro-caixa da ONG."
      >
        <form onSubmit={handleSaveLancamento} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as TipoLancamento })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="SAIDA">Saída / Despesa</option>
                <option value="ENTRADA">Entrada / Receita</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Categoria</label>
              <select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="UNIFORMES">Uniformes</option>
                <option value="MATERIAIS">Materiais Esportivos</option>
                <option value="SALARIOS">Salários / Folha</option>
                <option value="TORNEIOS">Torneios</option>
                <option value="EVENTOS">Eventos</option>
                <option value="ADMINISTRATIVO">Administrativo</option>
                <option value="REPASSES">Repasses Públicos</option>
                <option value="DOACOES">Doações</option>
                <option value="PATROCINIOS">Patrocínios</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Descrição do Lançamento *
            </label>
            <input
              type="text"
              required
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Ex: Aquisição de Bolas Penalty"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Valor (R$) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Data de Vencimento *
              </label>
              <input
                type="date"
                required
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Forma de Pagamento</label>
              <select
                value={form.formaPagamento}
                onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto</option>
                <option value="TRANSFERENCIA">Transferência</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusFinanceiro })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="PAGO">Pago</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PROGRAMADO">Programado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              URL do Comprovante / Nota Fiscal
            </label>
            <input
              type="text"
              value={form.comprovanteUrl}
              onChange={(e) => setForm({ ...form, comprovanteUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="https://exemplo.com/nf.pdf"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              Salvar Lançamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
