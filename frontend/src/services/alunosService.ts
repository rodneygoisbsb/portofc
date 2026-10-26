import { apiClient, isRemoteApiConfigured } from './api';
import { Aluno, CategoriaAluno } from '../types';
import { fallbackStorage } from './storageFallback';

export const alunosService = {
  async listar(categoria?: CategoriaAluno, busca?: string): Promise<Aluno[]> {
    if (isRemoteApiConfigured) {
      try {
        const response = await apiClient.get<Aluno[]>('/alunos', {
          params: { categoria, busca },
        });
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback
      }
    }
    let list = fallbackStorage.getAlunos();
    if (categoria && categoria !== ('TODAS' as any)) {
      list = list.filter(a => a.categoria === categoria);
    }
    if (busca && busca.trim()) {
      const term = busca.toLowerCase();
      list = list.filter(a => a.nome.toLowerCase().includes(term) || (a.cpf && a.cpf.includes(term)));
    }
    return list;
  },

  async buscarPorId(id: number): Promise<Aluno> {
    try {
      const response = await apiClient.get<Aluno>(`/alunos/${id}`);
      return response.data;
    } catch {
      const found = fallbackStorage.getAlunos().find(a => a.id === id);
      if (found) return found;
      throw new Error('Aluno não encontrado');
    }
  },

  async salvar(aluno: Partial<Aluno>): Promise<Aluno> {
    try {
      if (aluno.id) {
        const response = await apiClient.put<Aluno>(`/alunos/${aluno.id}`, aluno);
        fallbackStorage.saveAluno(response.data);
        return response.data;
      } else {
        const response = await apiClient.post<Aluno>('/alunos', aluno);
        fallbackStorage.saveAluno(response.data);
        return response.data;
      }
    } catch {
      return fallbackStorage.saveAluno(aluno);
    }
  },

  async deletar(id: number): Promise<void> {
    try {
      await apiClient.delete(`/alunos/${id}`);
    } catch {
      // Local fallback
    }
    fallbackStorage.deleteAluno(id);
  },
};

