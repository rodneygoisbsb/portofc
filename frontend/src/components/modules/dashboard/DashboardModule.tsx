import React, { useEffect, useState } from 'react';
import {
  Wallet,
  PiggyBank,
  Users,
  Percent,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  PieChart as LucidePieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { dashboardService } from '../../../services/dashboardService';
import { DashboardStats } from '../../../types';

export const DashboardModule: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const COLORS = ['#1d4ed8', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#db2777'];

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Saldo Disponivel */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saldo Disponível
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{formatBRL(stats.saldoDisponivel)}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">Total Recebido</span> - Total Pago
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Receitas Pagas</span>
            <span className="font-semibold text-slate-800">{formatBRL(stats.totalReceitasPagas)}</span>
          </div>
        </Card>

        {/* Saldo Livre */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saldo Livre
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <PiggyBank size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{formatBRL(stats.saldoLivre)}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              Abatendo despesas comprometidas
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Comprometido</span>
            <span className="font-semibold text-amber-600">{formatBRL(stats.totalDespesasComprometidas)}</span>
          </div>
        </Card>

        {/* Alunos Ativos */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Alunos Ativos
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalAlunosAtivos}</h3>
            <p className="text-xs text-slate-500 mt-1">Matrículas ativas no projeto</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Categorias</span>
            <span className="font-semibold text-slate-800">Sub-7 ao Adulto</span>
          </div>
        </Card>

        {/* Frequência Média Global */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Frequência Global
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
              <Percent size={20} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{stats.taxaFrequenciaGlobal}%</h3>
              <Badge variant={stats.taxaFrequenciaGlobal >= 75 ? 'success' : 'warning'}>
                {stats.taxaFrequenciaGlobal >= 75 ? 'Meta Atingida' : 'Abaixo da Meta'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Média dos últimos 30 dias</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Meta mínima</span>
            <span className="font-semibold text-slate-800">75.0% de presença</span>
          </div>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orçamento Previsto x Realizado */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-900">Execução Orçamentária</h4>
              <p className="text-xs text-slate-400 mt-0.5">Previsto vs. Executado por mês do projeto</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.execucaoOrcamentaria} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mesReferencia" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `R$ ${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatBRL(Number(val)), '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" />
                <Bar name="Previsto (Meta)" dataKey="previsto" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                <Bar name="Realizado (Gasto)" dataKey="realizado" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Despesas por Categoria */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-slate-900">Distribuição de Despesas</h4>
              <p className="text-xs text-slate-400 mt-0.5">Alocação de recursos por categoria de gastos</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center">
              <LucidePieChart size={16} />
            </div>
          </div>

          <div className="h-72 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.despesasPorCategoria}
                  dataKey="total"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {stats.despesasPorCategoria.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatBRL(Number(val)), 'Total']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
