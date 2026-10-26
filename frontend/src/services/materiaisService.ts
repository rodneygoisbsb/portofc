import { apiClient, isRemoteApiConfigured } from './api';
import { Material, Uniforme } from '../types';
import { fallbackStorage } from './storageFallback';

export const materiaisService = {
  async listarMateriais(): Promise<Material[]> {
    if (isRemoteApiConfigured) {
      try {
        const response = await apiClient.get<Material[]>('/materiais');
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback
      }
    }
    return fallbackStorage.getMateriais();
  },

  async salvarMaterial(material: Partial<Material>): Promise<Material> {
    try {
      const response = await apiClient.post<Material>('/materiais', material);
      fallbackStorage.saveMaterial(response.data);
      return response.data;
    } catch {
      return fallbackStorage.saveMaterial(material);
    }
  },

  async deletarMaterial(id: number): Promise<void> {
    try {
      await apiClient.delete(`/materiais/${id}`);
    } catch {
      // Local fallback
    }
    fallbackStorage.deleteMaterial(id);
  },

  async listarUniformes(): Promise<Uniforme[]> {
    if (isRemoteApiConfigured) {
      try {
        const response = await apiClient.get<Uniforme[]>('/materiais/uniformes');
        if (Array.isArray(response.data) && response.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback
      }
    }
    return fallbackStorage.getUniformes();
  },

  async salvarUniforme(uniforme: Partial<Uniforme>): Promise<Uniforme> {
    try {
      const response = await apiClient.post<Uniforme>('/materiais/uniformes', uniforme);
      fallbackStorage.saveUniforme(response.data);
      return response.data;
    } catch {
      return fallbackStorage.saveUniforme(uniforme);
    }
  },

  async deletarUniforme(id: number): Promise<void> {
    try {
      await apiClient.delete(`/materiais/uniformes/${id}`);
    } catch {
      // Local fallback
    }
    fallbackStorage.deleteUniforme(id);
  },

  async entregarUniforme(uniformeId: number, quantidade: number, alunoId?: number): Promise<Uniforme> {
    try {
      const response = await apiClient.post<Uniforme>('/materiais/uniformes/entrega', {
        uniformeId,
        quantidade,
        alunoId,
      });
      fallbackStorage.entregarUniforme(uniformeId, quantidade);
      return response.data;
    } catch {
      return fallbackStorage.entregarUniforme(uniformeId, quantidade);
    }
  },
};

