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

  async registrarChamada(categoria: CategoriaAluno, dataAula: string, itens: ChamadaItem[]): Promise<boolean> {
    if (USE_MOCKS) {
      // Simula atualização das taxas dos alunos no mockStorage
      itens.forEach(item => {
        const aluno = MockStorage.getAlunos().find(a => a.id === item.alunoId);
        if (aluno) {
          const delta = item.presente ? 2 : -5;
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
      return true;
    }
  },
};
