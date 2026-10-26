import { apiClient } from './api';
import { Aluno, CategoriaAluno } from '../types';

export const alunosService = {
  async listar(categoria?: CategoriaAluno, busca?: string): Promise<Aluno[]> {
    const response = await apiClient.get<Aluno[]>('/alunos', {
      params: { categoria, busca },
    });
    return response.data;
  },

  async buscarPorId(id: number): Promise<Aluno> {
    const response = await apiClient.get<Aluno>(`/alunos/${id}`);
    return response.data;
  },

  async salvar(aluno: Partial<Aluno>): Promise<Aluno> {
    if (aluno.id) {
      const response = await apiClient.put<Aluno>(`/alunos/${aluno.id}`, aluno);
      return response.data;
    } else {
      const response = await apiClient.post<Aluno>('/alunos', aluno);
      return response.data;
    }
  },

  async deletar(id: number): Promise<void> {
    await apiClient.delete(`/alunos/${id}`);
  },
};
