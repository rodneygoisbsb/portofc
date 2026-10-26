import { apiClient } from './api';
import { CategoriaAluno, ChamadaItem, FrequenciaEstatistica } from '../types';

export const frequenciaService = {
  async obterEstatisticas(categoria?: CategoriaAluno): Promise<FrequenciaEstatistica[]> {
    const response = await apiClient.get<FrequenciaEstatistica[]>('/frequencias/estatisticas', {
      params: { categoria },
    });
    return response.data;
  },

  async obterChamada(
    categoria: CategoriaAluno,
    dataAula: string,
    _turma?: string,
    _horario?: string
  ): Promise<{ itens: ChamadaItem[]; dataRegistro: string } | null> {
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
        dataRegistro: `${dataAula}T10:00:00`,
      };
    }
    return null;
  },

  async registrarChamada(
    categoria: CategoriaAluno,
    dataAula: string,
    itens: ChamadaItem[],
    _turma?: string,
    _horario?: string
  ): Promise<boolean> {
    await apiClient.post('/frequencias/chamada', {
      categoria,
      dataAula,
      itens,
    });
    return true;
  },
};
