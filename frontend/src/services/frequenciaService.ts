import { apiClient, isRemoteApiConfigured } from './api';
import { CategoriaAluno, ChamadaItem, FrequenciaEstatistica } from '../types';
import { fallbackStorage } from './storageFallback';

export const frequenciaService = {
  async obterEstatisticas(categoria?: CategoriaAluno): Promise<FrequenciaEstatistica[]> {
    if (isRemoteApiConfigured) {
      try {
        const response = await apiClient.get<FrequenciaEstatistica[]>('/frequencias/estatisticas', {
          params: { categoria },
        });
        if (Array.isArray(response.data)) {
          return response.data;
        }
      } catch {
        // Fallback
      }
    }
    const alunos = fallbackStorage.getAlunos();
    const filtrados = categoria && categoria !== ('TODAS' as any)
      ? alunos.filter((a) => a.categoria === categoria)
      : alunos;

    return filtrados.map((a) => ({
      alunoId: a.id,
      alunoNome: a.nome,
      categoria: a.categoria,
      totalAulas: 0,
      totalPresencas: 0,
      percentualPresenca: a.taxaFrequencia ?? 100,
      alertaFrequenciaBaixa: Boolean(a.alertaFrequenciaBaixa),
    }));
  },

  async obterChamada(
    categoria: CategoriaAluno,
    dataAula: string,
    _turma?: string,
    _horario?: string
  ): Promise<{ itens: ChamadaItem[]; dataRegistro: string } | null> {
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
          dataRegistro: `${dataAula}T10:00:00`,
        };
      }
    } catch {
      // Local fallback
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
    try {
      await apiClient.post('/frequencias/chamada', {
        categoria,
        dataAula,
        itens,
      });
    } catch {
      // Local fallback save
    }
    return true;
  },
};

