import { apiClient, USE_MOCKS } from './api';
import { Material, Uniforme } from '../types';
import { MockStorage } from '../mocks/mockStorage';

export const materiaisService = {
  async listarMateriais(): Promise<Material[]> {
    if (USE_MOCKS) {
      return MockStorage.getMateriais();
    }
    try {
      const response = await apiClient.get<Material[]>('/materiais');
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao listar materiais', error);
      return MockStorage.getMateriais();
    }
  },

  async salvarMaterial(material: Partial<Material>): Promise<Material> {
    if (USE_MOCKS) {
      return MockStorage.saveMaterial(material);
    }
    try {
      const response = await apiClient.post<Material>('/materiais', material);
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao salvar material', error);
      return MockStorage.saveMaterial(material);
    }
  },

  async listarUniformes(): Promise<Uniforme[]> {
    if (USE_MOCKS) {
      return MockStorage.getUniformes();
    }
    try {
      const response = await apiClient.get<Uniforme[]>('/materiais/uniformes');
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao listar uniformes', error);
      return MockStorage.getUniformes();
    }
  },

  async entregarUniforme(uniformeId: number, quantidade: number, alunoId?: number): Promise<Uniforme> {
    if (USE_MOCKS) {
      return MockStorage.entregarUniforme(uniformeId, quantidade);
    }
    try {
      const response = await apiClient.post<Uniforme>('/materiais/uniformes/entrega', {
        uniformeId,
        quantidade,
        alunoId,
      });
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao entregar uniforme', error);
      return MockStorage.entregarUniforme(uniformeId, quantidade);
    }
  },
};
