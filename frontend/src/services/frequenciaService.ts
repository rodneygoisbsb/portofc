import { apiClient, USE_MOCKS } from './api';
import { CategoriaAluno, ChamadaItem, FrequenciaEstatistica } from '../types';
import { MockStorage } from '../mocks/mockStorage';

export const frequenciaService = {
  async obterEstatisticas(categoria?: CategoriaAluno): Promise<FrequenciaEstatistica[]> {
    if (USE_MOCKS) {
      const alunos = MockStorage.getAlunos(categoria);
      return alunos.map(a => ({
        alunoId: a.id,
        alunoNome: a.nome,
        fotoUrl: a.fotoUrl,
        categoria: a.categoria,
        totalAulas: 10,
        totalPresencas: Math.round(((a.taxaFrequencia || 90) / 100) * 10),
        percentualPresenca: a.taxaFrequencia || 90,
        alertaFrequenciaBaixa: (a.taxaFrequencia || 90) < 75,
      }));
    }
    try {
      const response = await apiClient.get<FrequenciaEstatistica[]>('/frequencias/estatisticas', {
        params: { categoria },
      });
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao obter estatísticas de frequência', error);
      const alunos = MockStorage.getAlunos(categoria);
      return alunos.map(a => ({
        alunoId: a.id,
        alunoNome: a.nome,
        fotoUrl: a.fotoUrl,
        categoria: a.categoria,
        totalAulas: 10,
        totalPresencas: Math.round(((a.taxaFrequencia || 90) / 100) * 10),
        percentualPresenca: a.taxaFrequencia || 90,
        alertaFrequenciaBaixa: (a.taxaFrequencia || 90) < 75,
      }));
    }
  },

  async obterChamada(
    categoria: CategoriaAluno,
    dataAula: string,
    turma?: string,
    horario?: string
  ): Promise<{ itens: ChamadaItem[]; dataRegistro: string } | null> {
    if (USE_MOCKS) {
      return MockStorage.getChamada(categoria, dataAula, turma, horario);
    }
    try {
      const response = await apiClient.get<any[]>('/frequencias', {
        params: { categoria, data: dataAula },
      });
      if (response.data && response.data.length > 0) {
        const itens: ChamadaItem[] = response.data.map((f: any) => ({
          alunoId: f.aluno?.id || f.alunoId,
          alunoNome: f.aluno?.nome || f.alunoNome || '',
          presente: f.presente ?? true,
          observacao: f.observacao || '',
        }));
        return {
          itens,
          dataRegistro: response.data[0]?.createdAt || dataAula,
        };
      }
      return null;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao obter chamada por data', error);
      return MockStorage.getChamada(categoria, dataAula, turma, horario);
    }
  },

  async registrarChamada(
    categoria: CategoriaAluno,
    dataAula: string,
    itens: ChamadaItem[],
    turma?: string,
    horario?: string
  ): Promise<boolean> {
    if (USE_MOCKS) {
      // 1. Salva no histórico de chamadas por data e turma
      MockStorage.saveChamada(categoria, dataAula, itens, turma, horario);

      // 2. Simula atualização das taxas dos alunos no mockStorage
      itens.forEach((item) => {
        const aluno = MockStorage.getAlunos().find((a) => a.id === item.alunoId);
        if (aluno) {
          const delta = item.presente ? 1 : -3;
          const novaTaxa = Math.min(100, Math.max(40, (aluno.taxaFrequencia || 90) + delta));
          MockStorage.saveAluno({
            id: aluno.id,
            taxaFrequencia: Math.round(novaTaxa * 10) / 10,
            alertaFrequenciaBaixa: novaTaxa < 75,
          });
        }
      });
      return true;
    }
    try {
      await apiClient.post('/frequencias/chamada', {
        categoria,
        dataAula,
        itens,
      });
      return true;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao registrar chamada', error);
      MockStorage.saveChamada(categoria, dataAula, itens, turma, horario);
      return true;
    }
  },
};
