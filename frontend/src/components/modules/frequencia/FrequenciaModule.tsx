import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Save,
  CheckCheck,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { alunosService } from '../../../services/alunosService';
import { frequenciaService } from '../../../services/frequenciaService';
import { Aluno, CategoriaAluno, ChamadaItem } from '../../../types';

export const FrequenciaModule: React.FC = () => {
  const [categoria, setCategoria] = useState<CategoriaAluno>('SUB_9');
  const [dataAula, setDataAula] = useState<string>(new Date().toISOString().split('T')[0]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [presencas, setPresencas] = useState<Record<number, boolean>>({});
  const [observacoes, setObservacoes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const categories: { key: CategoriaAluno; label: string }[] = [
    { key: 'SUB_7', label: 'Sub-7' },
    { key: 'SUB_9', label: 'Sub-9' },
    { key: 'SUB_15', label: 'Sub-15' },
    { key: 'SUB_17', label: 'Sub-17' },
    { key: 'ADULTO', label: 'Adulto' },
  ];

  useEffect(() => {
    loadAlunos();
  }, [categoria]);

  const loadAlunos = async () => {
    try {
      setLoading(true);
      const data = await alunosService.listar(categoria);
      setAlunos(data);

      // Iniciar presenças (default true para agilidade)
      const initialMap: Record<number, boolean> = {};
      const obsMap: Record<number, string> = {};
      data.forEach((a) => {
        initialMap[a.id] = true;
        obsMap[a.id] = '';
      });
      setPresencas(initialMap);
      setObservacoes(obsMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
    alunos.forEach((a) => {
      updated[a.id] = true;
    });
    setPresencas(updated);
  };

  const handleSalvarChamada = async () => {
    try {
      setSaving(true);
      const itens: ChamadaItem[] = alunos.map((a) => ({
        alunoId: a.id,
        alunoNome: a.nome,
        presente: presencas[a.id] ?? true,
        observacao: observacoes[a.id],
      }));

      await frequenciaService.registrarChamada(categoria, dataAula, itens);
      setFeedbackMsg(`Chamada da turma ${categoria.replace('_', '-')} salva com sucesso!`);
      setTimeout(() => setFeedbackMsg(null), 4000);
      loadAlunos();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar chamada.');
    } finally {
      setSaving(false);
    }
  };

  // Cálculo de presença do dia
  const presentesHoje = Object.values(presencas).filter(Boolean).length;
  const totalTurma = alunos.length;
  const taxaHoje = totalTurma > 0 ? Math.round((presentesHoje / totalTurma) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Chamada Diária & Frequência</h2>
          <p className="text-sm text-slate-500 mt-1">
            Registro ágil de presenças por categoria e detecção de baixa assiduidade.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            Salvar Chamada
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm font-medium animate-in fade-in">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Turma and Date Controls */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
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

        {/* Date Selector and Daily Metric */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="date"
              value={dataAula}
              onChange={(e) => setDataAula(e.target.value)}
              className="text-sm text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-200">
            <div>
              <p className="text-xs text-slate-400 leading-none">Presença Hoje</p>
              <p className="text-base font-bold text-slate-900 mt-1">
                {presentesHoje}/{totalTurma} ({taxaHoje}%)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance List */}
      <Card noPadding>
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Carregando lista de chamada...</div>
        ) : alunos.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Nenhum aluno cadastrado nesta categoria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-4 px-6">Aluno</th>
                  <th className="py-4 px-4 text-center">Frequência Global</th>
                  <th className="py-4 px-4 text-center">Presença na Aula</th>
                  <th className="py-4 px-6">Observação do Instrutor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {alunos.map((aluno) => {
                  const isPresente = presencas[aluno.id] ?? true;
                  const freqMedia = aluno.taxaFrequencia ?? 90;
                  const isCritical = aluno.alertaFrequenciaBaixa || freqMedia < 75;

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
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isCritical
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {freqMedia}%
                          </span>
                          {isCritical && (
                            <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle size={10} /> Alerta &lt; 75%
                            </span>
                          )}
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
    </div>
  );
};
