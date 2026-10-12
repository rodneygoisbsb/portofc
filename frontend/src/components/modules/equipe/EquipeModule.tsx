import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  FileCheck,
  UserPlus,
  Mail,
  Phone,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import { equipeService } from '../../../services/equipeService';
import { Colaborador, FolhaAula, StatusFolha, TipoContratacao } from '../../../types';

export const EquipeModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'folha'>('folha');
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [folhas, setFolhas] = useState<FolhaAula[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Colaborador
  const [isColabModalOpen, setIsColabModalOpen] = useState(false);
  const [colabForm, setColabForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    funcao: 'Professor de Futebol',
    tipoContratacao: 'HORISTA' as TipoContratacao,
    valorHora: 50.0,
    salarioFixo: 0,
    beneficios: 200.0,
    fotoUrl: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [colabs, folhaList] = await Promise.all([
        equipeService.listarColaboradores(),
        equipeService.listarFolhas('2026-10'),
      ]);
      setColaboradores(colabs);
      setFolhas(folhaList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFolhaStatus = async (folha: FolhaAula) => {
    const novoStatus: StatusFolha = folha.status === 'PAGO' ? 'PENDENTE' : 'PAGO';
    await equipeService.atualizarStatusFolha(folha.id, novoStatus);
    loadData();
  };

  const handleSaveColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colabForm.nome) return;

    await equipeService.salvarColaborador({
      ...colabForm,
      fotoUrl:
        colabForm.fotoUrl ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });
    setIsColabModalOpen(false);
    loadData();
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Somatórios da Folha
  const totalFolhaBruta = folhas.reduce((acc, f) => acc + f.totalBruto, 0);
  const totalFolhaLiquida = folhas.reduce((acc, f) => acc + f.liquidoPagar, 0);
  const totalFolhaPaga = folhas.filter((f) => f.status === 'PAGO').reduce((acc, f) => acc + f.liquidoPagar, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe & Folha de Pagamento</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gestão do corpo técnico, apuração de aulas por hora e emissão de folhas.
          </p>
        </div>
        <Button variant="emerald" icon={<UserPlus size={18} />} onClick={() => setIsColabModalOpen(true)}>
          Novo Colaborador
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('folha')}
          className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'folha'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign size={17} />
          Apuração da Folha de Aulas (Outubro/2026)
        </button>
        <button
          onClick={() => setActiveTab('colaboradores')}
          className={`pb-3 px-4 text-sm font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'colaboradores'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase size={17} />
          Corpo Docente & Administrativo ({colaboradores.length})
        </button>
      </div>

      {activeTab === 'folha' ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Bruto de Aulas
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{formatBRL(totalFolhaBruta)}</h3>
              <p className="text-xs text-slate-500 mt-1">Soma de horas trabalhadas + salários fixos</p>
            </Card>

            <Card>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Líquido Apurado
              </span>
              <h3 className="text-2xl font-bold text-blue-700 mt-2">{formatBRL(totalFolhaLiquida)}</h3>
              <p className="text-xs text-slate-500 mt-1">Total Bruto + Benefícios - Descontos</p>
            </Card>

            <Card>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Efetivamente Pago
              </span>
              <h3 className="text-2xl font-bold text-emerald-700 mt-2">{formatBRL(totalFolhaPaga)}</h3>
              <p className="text-xs text-slate-500 mt-1">Lançamentos compensados no mês</p>
            </Card>
          </div>

          {/* Folha Table */}
          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-4 px-6">Profissional</th>
                    <th className="py-4 px-4 text-center">Horas Registradas</th>
                    <th className="py-4 px-4 text-center">Valor / Hora</th>
                    <th className="py-4 px-4 text-right">Total Bruto</th>
                    <th className="py-4 px-4 text-right">Benefícios / Descontos</th>
                    <th className="py-4 px-4 text-right">Líquido a Pagar</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {folhas.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.colaboradorFotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                            alt={item.colaboradorNome}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">
                              {item.colaboradorNome}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{item.colaboradorFuncao}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center font-semibold text-slate-800">
                        {item.horasRegistradas}h
                      </td>

                      <td className="py-4 px-4 text-center text-slate-600">
                        {formatBRL(item.valorHora)}/h
                      </td>

                      <td className="py-4 px-4 text-right font-medium text-slate-800">
                        {formatBRL(item.totalBruto)}
                      </td>

                      <td className="py-4 px-4 text-right text-xs">
                        <span className="text-emerald-600 font-semibold">+{formatBRL(item.beneficios)}</span>
                        <br />
                        <span className="text-rose-600 font-semibold">-{formatBRL(item.descontos)}</span>
                      </td>

                      <td className="py-4 px-4 text-right font-bold text-slate-900">
                        {formatBRL(item.liquidoPagar)}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleFolhaStatus(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
                            item.status === 'PAGO'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100'
                          }`}
                        >
                          {item.status === 'PAGO' ? <CheckCircle size={13} /> : <Clock size={13} />}
                          {item.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Colaboradores Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {colaboradores.map((c) => (
            <Card key={c.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <img
                    src={c.fotoUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={c.nome}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
                  />
                  <Badge variant={c.status === 'ATIVO' ? 'success' : 'neutral'}>{c.status}</Badge>
                </div>
                <h4 className="font-bold text-slate-900 mt-4 leading-snug">{c.nome}</h4>
                <p className="text-xs text-blue-700 font-medium mt-1">{c.funcao}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" /> {c.email || 'Não informado'}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> {c.telefone || 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Contratação</span>
                <span className="font-bold text-slate-800">
                  {c.tipoContratacao === 'HORISTA'
                    ? `${formatBRL(c.valorHora || 50)}/h`
                    : `${formatBRL(c.salarioFixo || 4500)} fixo`}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Novo Colaborador */}
      <Modal
        isOpen={isColabModalOpen}
        onClose={() => setIsColabModalOpen(false)}
        title="Cadastrar Novo Membro da Equipe"
        description="Adicione instrutores, coordenadores ou apoio pedagógico."
      >
        <form onSubmit={handleSaveColaborador} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome Completo *</label>
            <input
              type="text"
              required
              value={colabForm.nome}
              onChange={(e) => setColabForm({ ...colabForm, nome: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/30"
              placeholder="Ex: Prof. Anderson Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">CPF</label>
              <input
                type="text"
                value={colabForm.cpf}
                onChange={(e) => setColabForm({ ...colabForm, cpf: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefone</label>
              <input
                type="text"
                value={colabForm.telefone}
                onChange={(e) => setColabForm({ ...colabForm, telefone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="(61) 99999-8888"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Função / Cargo</label>
            <input
              type="text"
              value={colabForm.funcao}
              onChange={(e) => setColabForm({ ...colabForm, funcao: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Ex: Professor Técnico de Futsal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tipo de Vínculo</label>
              <select
                value={colabForm.tipoContratacao}
                onChange={(e) =>
                  setColabForm({ ...colabForm, tipoContratacao: e.target.value as TipoContratacao })
                }
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="HORISTA">Horista (por hora/aula)</option>
                <option value="MENSALISTA">Mensalista (salário fixo)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                {colabForm.tipoContratacao === 'HORISTA' ? 'Valor da Hora (R$)' : 'Salário Fixo (R$)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={colabForm.tipoContratacao === 'HORISTA' ? colabForm.valorHora : colabForm.salarioFixo}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0;
                  if (colabForm.tipoContratacao === 'HORISTA') {
                    setColabForm({ ...colabForm, valorHora: v });
                  } else {
                    setColabForm({ ...colabForm, salarioFixo: v });
                  }
                }}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsColabModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="emerald" type="submit">
              Salvar Membro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
