import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  Filter,
  DollarSign,
  Clock,
  Wallet,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { EmptyState } from '../../ui/EmptyState';
import { financeiroService } from '../../../services/financeiroService';
import { FormaPagamento, LancamentoFinanceiro, StatusFinanceiro } from '../../../types';

interface GastosCategoriaPanelProps {
  /** Id da categoria no Financeiro (ex: TORNEIOS, EVENTOS, ADMINISTRATIVO) */
  categoria: string;
  titulo: string;
  descricao: string;
  /** Texto do botão de novo gasto */
  labelNovo: string;
  placeholderDescricao: string;
  icon: LucideIcon;
  /** Valor padrão do teto caso a rubrica não esteja configurada na Matriz Orçamentária */
  tetoPadrao: number;
}

interface GastoForm {
  descricao: string;
  valor: string;
  dataVencimento: string;
  dataPagamento: string;
  formaPagamento: FormaPagamento;
  status: StatusFinanceiro;
}

const hoje = () => new Date().toISOString().split('T')[0];

const emptyForm = (): GastoForm => ({
  descricao: '',
  valor: '',
  dataVencimento: hoje(),
  dataPagamento: '',
  formaPagamento: 'PIX',
  status: 'PAGO',
});

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatMes = (mesAno: string) => {
  const [ano, mes] = mesAno.split('-');
  const nomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${nomes[parseInt(mes, 10) - 1] || mes}/${ano}`;
};

const formatData = (iso?: string) => {
  if (!iso) return '-';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
};

export const GastosCategoriaPanel: React.FC<GastosCategoriaPanelProps> = ({
  categoria,
  titulo,
  descricao,
  labelNovo,
  placeholderDescricao,
  icon: Icon,
  tetoPadrao,
}) => {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroMes, setFiltroMes] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<LancamentoFinanceiro | null>(null);
  const [form, setForm] = useState<GastoForm>(emptyForm());

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await financeiroService.listarLancamentos(undefined, undefined, categoria);
      // Apenas despesas da categoria (gastos)
      setLancamentos(
        list
          .filter((l) => l.categoria.toUpperCase() === categoria && l.tipo === 'SAIDA')
          .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria]);

  // Meses disponíveis para o filtro de período
  const mesesDisponiveis = useMemo(() => {
    const set = new Set(lancamentos.map((l) => l.dataVencimento.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [lancamentos]);

  const filtrados = useMemo(() => {
    return lancamentos.filter((l) => {
      const matchStatus = filtroStatus === 'TODOS' || l.status === filtroStatus;
      const matchMes = filtroMes === 'TODOS' || l.dataVencimento.startsWith(filtroMes);
      const matchSearch =
        searchTerm === '' || l.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchMes && matchSearch;
    });
  }, [lancamentos, filtroStatus, filtroMes, searchTerm]);

  // Totais gerais da categoria (sem filtros) e do recorte filtrado
  const totalPago = lancamentos.filter((l) => l.status === 'PAGO').reduce((a, l) => a + l.valor, 0);
  const totalComprometido = lancamentos
    .filter((l) => l.status !== 'PAGO')
    .reduce((a, l) => a + l.valor, 0);
  const totalGeral = totalPago + totalComprometido;
  const totalFiltrado = filtrados.reduce((a, l) => a + l.valor, 0);

  // Teto da rubrica vindo da Matriz Orçamentária (Financeiro)
  const tetoRubrica = useMemo(() => {
    try {
      const saved = localStorage.getItem('portofc_matriz_rubricas');
      if (saved) {
        const rubricas = JSON.parse(saved);
        const r = rubricas.find((x: any) => x.id === categoria);
        if (r && typeof r.previsto === 'number') return r.previsto;
      }
    } catch (e) {
      console.warn(e);
    }
    return tetoPadrao;
  }, [categoria, tetoPadrao]);

  const saldoRubrica = tetoRubrica - totalGeral;
  const pctTeto = tetoRubrica > 0 ? Math.min(100, (totalGeral / tetoRubrica) * 100) : 0;

  const handleOpenCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (l: LancamentoFinanceiro) => {
    setEditing(l);
    setForm({
      descricao: l.descricao,
      valor: String(l.valor),
      dataVencimento: l.dataVencimento,
      dataPagamento: l.dataPagamento || '',
      formaPagamento: l.formaPagamento || 'PIX',
      status: l.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const valorNum = parseFloat(form.valor.replace(',', '.')) || 0;
    if (!form.descricao.trim() || valorNum <= 0) {
      alert('Descrição e um valor válido (maior que zero) são obrigatórios.');
      return;
    }

    await financeiroService.salvarLancamento({
      ...(editing
        ? {
            id: editing.id,
            comprovanteUrl: editing.comprovanteUrl,
            comprovanteNome: editing.comprovanteNome,
            comprovanteTipo: editing.comprovanteTipo,
          }
        : {}),
      tipo: 'SAIDA',
      categoria,
      descricao: form.descricao.trim(),
      valor: valorNum,
      dataVencimento: form.dataVencimento,
      dataPagamento: form.status === 'PAGO' ? form.dataPagamento || form.dataVencimento : undefined,
      formaPagamento: form.formaPagamento,
      status: form.status,
    });

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja excluir este gasto? Ele também será removido do livro-caixa do Financeiro.')) {
      await financeiroService.deletarLancamento(id);
      loadData();
    }
  };

  const resetFiltros = () => {
    setFiltroStatus('TODOS');
    setFiltroMes('TODOS');
    setSearchTerm('');
  };

  const filtrosAtivos = filtroStatus !== 'TODOS' || filtroMes !== 'TODOS' || searchTerm !== '';

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Gasto Total
            </span>
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Wallet size={15} />
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-2">{formatBRL(totalGeral)}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {lancamentos.length} {lancamentos.length === 1 ? 'lançamento' : 'lançamentos'} registrados
          </p>
        </Card>

        <Card className="p-4 border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pago / Liquidado
            </span>
            <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <DollarSign size={15} />
            </span>
          </div>
          <h3 className="text-xl font-bold text-emerald-700 mt-2">{formatBRL(totalPago)}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Já saiu do caixa</p>
        </Card>

        <Card className="p-4 border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Pendente / Programado
            </span>
            <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
              <Clock size={15} />
            </span>
          </div>
          <h3 className="text-xl font-bold text-amber-700 mt-2">{formatBRL(totalComprometido)}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Ainda a pagar</p>
        </Card>

        <Card className="p-4 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
              Saldo da Rubrica
            </span>
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <ShoppingBag size={15} />
            </span>
          </div>
          <h3
            className={`text-xl font-bold mt-2 ${saldoRubrica < 0 ? 'text-rose-700' : 'text-indigo-900'}`}
          >
            {formatBRL(saldoRubrica)}
          </h3>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all ${
                pctTeto > 100 ? 'bg-rose-500' : pctTeto > 80 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${pctTeto}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Teto da rubrica: {formatBRL(tetoRubrica)}</p>
        </Card>
      </div>

      {/* Tabela de gastos */}
      <Card noPadding className="border border-slate-200/80 shadow-xs overflow-hidden rounded-2xl bg-white">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Icon size={17} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{titulo}</h3>
              <p className="text-xs text-slate-500">{descricao}</p>
            </div>
          </div>

          <Button variant="emerald" size="sm" icon={<Plus size={14} />} onClick={handleOpenCreate}>
            {labelNovo}
          </Button>
        </div>

        {/* Filtros */}
        <div className="p-3 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por descrição..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={13} className="text-blue-600" /> Período:
            </span>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="TODOS">Todos os meses</option>
              {mesesDisponiveis.map((m) => (
                <option key={m} value={m}>
                  {formatMes(m)}
                </option>
              ))}
            </select>

            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter size={13} className="text-blue-600" /> Status:
            </span>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold text-slate-700 cursor-pointer"
            >
              <option value="TODOS">Todos os status</option>
              <option value="PAGO">Pago</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PROGRAMADO">Programado</option>
            </select>

            {filtrosAtivos && (
              <button
                type="button"
                onClick={resetFiltros}
                className="text-[11px] text-slate-500 hover:text-slate-700 underline cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Carregando gastos...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Nenhum gasto encontrado"
              description={
                lancamentos.length === 0
                  ? 'Ainda não há gastos registrados nesta categoria.'
                  : 'Nenhum registro atende aos filtros atuais.'
              }
              actionText={lancamentos.length === 0 ? labelNovo : 'Limpar Filtros'}
              onAction={lancamentos.length === 0 ? handleOpenCreate : resetFiltros}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-3 text-center">Vencimento</th>
                  <th className="py-3 px-3 text-center">Pagamento</th>
                  <th className="py-3 px-3">Forma</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtrados.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4">
                      <p className="font-semibold text-slate-900 text-xs">{l.descricao}</p>
                    </td>
                    <td className="py-2.5 px-3 text-center text-[11px] text-slate-500 whitespace-nowrap">
                      {formatData(l.dataVencimento)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[11px] text-slate-500 whitespace-nowrap">
                      {formatData(l.dataPagamento)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap">
                      {l.formaPagamento || 'PIX'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant={
                          l.status === 'PAGO' ? 'success' : l.status === 'PENDENTE' ? 'warning' : 'info'
                        }
                      >
                        {l.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatBRL(l.valor)}
                    </td>
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(l)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                          title="Editar gasto"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(l.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-all cursor-pointer"
                          title="Excluir gasto"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50/90 font-bold text-slate-900 border-t-2 border-slate-200 text-xs">
                  <td className="py-3 px-4 uppercase" colSpan={5}>
                    {filtrosAtivos ? 'Total do filtro' : 'Total'} ({filtrados.length}{' '}
                    {filtrados.length === 1 ? 'registro' : 'registros'})
                  </td>
                  <td className="py-3 px-3 text-right font-black text-blue-700 whitespace-nowrap">
                    {formatBRL(totalFiltrado)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Novo / Editar Gasto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? `Editar Gasto - ${titulo}` : labelNovo}
        description="O gasto é registrado como despesa no livro-caixa do Financeiro."
        maxWidth="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Descrição *
            </label>
            <input
              type="text"
              required
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder={placeholderDescricao}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                placeholder="0,00"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Forma de Pagamento
              </label>
              <select
                value={form.formaPagamento}
                onChange={(e) => setForm({ ...form, formaPagamento: e.target.value as FormaPagamento })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
              >
                <option value="PIX">PIX</option>
                <option value="BOLETO">Boleto Bancário</option>
                <option value="TRANSFERENCIA">Transferência / TED</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusFinanceiro })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
              >
                <option value="PAGO">Pago / Liquidado</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PROGRAMADO">Programado</option>
              </select>
            </div>

            {form.status === 'PAGO' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Data do Pagamento
                </label>
                <input
                  type="date"
                  value={form.dataPagamento}
                  onChange={(e) => setForm({ ...form, dataPagamento: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              {editing ? 'Salvar Alterações' : 'Registrar Gasto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
