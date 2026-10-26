import { apiClient } from './api';
import { Material, Uniforme } from '../types';

export const materiaisService = {
  async listarMateriais(): Promise<Material[]> {
    const response = await apiClient.get<Material[]>('/materiais');
    return response.data;
  },

  async salvarMaterial(material: Partial<Material>): Promise<Material> {
    const response = await apiClient.post<Material>('/materiais', material);
    return response.data;
  },

  async deletarMaterial(id: number): Promise<void> {
    await apiClient.delete(`/materiais/${id}`);
  },

  async listarUniformes(): Promise<Uniforme[]> {
    const response = await apiClient.get<Uniforme[]>('/materiais/uniformes');
    return response.data;
  },

  async salvarUniforme(uniforme: Partial<Uniforme>): Promise<Uniforme> {
    const response = await apiClient.post<Uniforme>('/materiais/uniformes', uniforme);
    return response.data;
  },

  async deletarUniforme(id: number): Promise<void> {
    await apiClient.delete(`/materiais/uniformes/${id}`);
  },

  async entregarUniforme(uniformeId: number, quantidade: number, alunoId?: number): Promise<Uniforme> {
    const response = await apiClient.post<Uniforme>('/materiais/uniformes/entrega', {
      uniformeId,
      quantidade,
      alunoId,
    });
    return response.data;
  },
};
