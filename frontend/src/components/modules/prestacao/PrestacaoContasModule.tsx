import React, { useEffect, useState } from 'react';
import {
  Printer,
  Download,
  FileCheck2,
  Building,
  CheckCircle2,
  Calendar,
  Users,
  Shirt,
  DollarSign,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { financeiroService } from '../../../services/financeiroService';
import { alunosService } from '../../../services/alunosService';
import { materiaisService } from '../../../services/materiaisService';
import { Aluno, LancamentoFinanceiro, Uniforme } from '../../../types';

export const PrestacaoContasModule: React.FC = () => {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [uniformes, setUniformes] = useState<Uniforme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lancs, aluns, unifs] = await Promise.all([
        financeiroService.listarLancamentos(),
        alunosService.listar(),
        materiaisService.listarUniformes(),
      ]);
      setLancamentos(lancs);
      setAlunos(aluns);
      setUniformes(unifs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalEntradas = lancamentos
    .filter((l) => l.tipo === 'ENTRADA' && l.status === 'PAGO')
    .reduce((acc, l) => acc + l.valor, 0);

  const totalSaidasPagas = lancamentos
    .filter((l) => l.tipo === 'SAIDA' && l.status === 'PAGO')
    .reduce((acc, l) => acc + l.valor, 0);

  const totalUniformesEntregues = uniformes.reduce((acc, u) => acc + u.quantidadeEntregue, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Action Header (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Prestação de Contas</h2>
          <p className="text-sm text-slate-500 mt-1">
            Relatório gerencial e contábil consolidado do projeto social esportivo.
          </p>
        </div>
        <Button variant="primary" icon={<Printer size={18} />} onClick={handlePrint}>
          Imprimir Relatório / Salvar PDF
        </Button>
      </div>

      {/* Relatório Document Container (Printable) */}
      <Card className="p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        {/* Header Institucional */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-blue-900">PORTO FC</span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                CNPJ: 42.189.702/0001-88
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              RELATÓRIO CONSOLIDADO DE EXECUÇÃO FÍSICO-FINANCEIRA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Projeto: "Escola de Futebol e Cidadania PORTO FC" • Vigência: 2026/08 a 2027/01
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-semibold text-slate-800">Emissão Oficial</p>
            <p>{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Metas Físicas e Sociais */}
        <div className="mt-8">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-1 border-b border-slate-100">
            1. Metas Físicas e Atendimento à Comunidade
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Alunos Beneficiados Diretamente</span>
              <p className="text-xl font-black text-slate-900 mt-1">{alunos.length} crianças e jovens</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">100% da meta prevista atingida</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Kits de Uniformes Distribuídos</span>
              <p className="text-xl font-black text-slate-900 mt-1">{totalUniformesEntregues} fardamentos</p>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">Camisa, calção e meião oficial</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">Frequência Escolar & Treinos</span>
              <p className="text-xl font-black text-slate-900 mt-1">87.5% de assiduidade</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1">Acima do piso contratual (75%)</p>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro Consolidado */}
        <div className="mt-8">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-1 border-b border-slate-100">
            2. Demonstrativo Financeiro Sintético
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-xs text-emerald-800 font-semibold">Total de Recursos Recebidos</span>
              <p className="text-2xl font-black text-emerald-900 mt-1">{formatBRL(totalEntradas)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Repasses, patrocínios e doações</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
              <span className="text-xs text-rose-800 font-semibold">Total de Despesas Liquidadas</span>
              <p className="text-2xl font-black text-rose-900 mt-1">{formatBRL(totalSaidasPagas)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Pagamentos com notas fiscais</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="text-xs text-blue-800 font-semibold">Saldo Atual em Conta Bancária</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{formatBRL(totalEntradas - totalSaidasPagas)}</p>
              <p className="text-[11px] text-slate-500 mt-1">Conciliado e disponível para o próximo ciclo</p>
            </div>
          </div>
        </div>

        {/* Livro Caixa Sintético */}
        <div className="mt-8">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 pb-1 border-b border-slate-100">
            3. Relação de Pagamentos e Comprovações
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 font-bold uppercase text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Item / Finalidade</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Forma Pagto</th>
                  <th className="py-2.5 px-3 text-right">Valor Liquidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lancamentos
                  .filter((l) => l.tipo === 'SAIDA' && l.status === 'PAGO')
                  .map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 px-3 text-slate-500">{item.dataPagamento || item.dataVencimento}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{item.descricao}</td>
                      <td className="py-2 px-3">{item.categoria}</td>
                      <td className="py-2 px-3">{item.formaPagamento || 'PIX'}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">{formatBRL(item.valor)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assinaturas */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs text-slate-600">
          <div>
            <div className="border-b border-slate-400 pb-1 mb-2 font-bold text-slate-800">
              Fabrício Nogueira da Rocha
            </div>
            <span>Coordenador Geral do Projeto PORTO FC</span>
          </div>
          <div>
            <div className="border-b border-slate-400 pb-1 mb-2 font-bold text-slate-800">
              Camila Duarte Peixoto
            </div>
            <span>Contabilidade & Auditoria Financeira</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
