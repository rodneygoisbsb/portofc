import { apiClient, USE_MOCKS } from './api';
import { Aluno, CategoriaAluno } from '../types';
import { MockStorage } from '../mocks/mockStorage';

export const alunosService = {
  async listar(categoria?: CategoriaAluno, busca?: string): Promise<Aluno[]> {
    if (USE_MOCKS) {
      return MockStorage.getAlunos(categoria, busca);
    }
    try {
      const response = await apiClient.get<Aluno[]>('/alunos', {
        params: { categoria, busca },
      });
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao listar alunos', error);
      return MockStorage.getAlunos(categoria, busca);
    }
  },

  async buscarPorId(id: number): Promise<Aluno> {
    if (USE_MOCKS) {
      const aluno = MockStorage.getAlunos().find(a => a.id === id);
      if (!aluno) throw new Error('Aluno não encontrado');
      return aluno;
    }
    try {
      const response = await apiClient.get<Aluno>(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      const aluno = MockStorage.getAlunos().find(a => a.id === id);
      if (!aluno) throw new Error('Aluno não encontrado');
      return aluno;
    }
  },

  async salvar(aluno: Partial<Aluno>): Promise<Aluno> {
    if (USE_MOCKS) {
      return MockStorage.saveAluno(aluno);
    }
    try {
      if (aluno.id) {
        const response = await apiClient.put<Aluno>(`/alunos/${aluno.id}`, aluno);
        return response.data;
      } else {
        const response = await apiClient.post<Aluno>('/alunos', aluno);
        return response.data;
      }
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao salvar aluno', error);
      return MockStorage.saveAluno(aluno);
    }
  },

  async deletar(id: number): Promise<void> {
    if (USE_MOCKS) {
      MockStorage.deleteAluno(id);
      return;
    }
    try {
      await apiClient.delete(`/alunos/${id}`);
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao deletar aluno', error);
      MockStorage.deleteAluno(id);
    }
  },
};
