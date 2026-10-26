import { apiClient } from './api';
import { Colaborador, FolhaAula, FormaPagamento, StatusFolha, TetoConfig } from '../types';
import { fallbackStorage } from './storageFallback';

export const equipeService = {
  async listarColaboradores(busca?: string): Promise<Colaborador[]> {
    try {
      const response = await apiClient.get<Colaborador[]>('/colaboradores', { params: { busca } });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Local fallback
    }
    let list = fallbackStorage.getColaboradores();
    if (busca && busca.trim()) {
      const t = busca.toLowerCase();
      list = list.filter(c => c.nome.toLowerCase().includes(t) || c.funcao.toLowerCase().includes(t));
    }
    return list;
  },

  async salvarColaborador(data: Partial<Colaborador>): Promise<Colaborador> {
    try {
      if (data.id) {
        const response = await apiClient.put<Colaborador>(`/colaboradores/${data.id}`, data);
        fallbackStorage.saveColaborador(response.data);
        return response.data;
      } else {
        const response = await apiClient.post<Colaborador>('/colaboradores', data);
        fallbackStorage.saveColaborador(response.data);
        return response.data;
      }
    } catch {
      return fallbackStorage.saveColaborador(data);
    }
  },

  async deletarColaborador(id: number): Promise<void> {
    try {
      await apiClient.delete(`/colaboradores/${id}`);
    } catch {
      // Local fallback
    }
    fallbackStorage.deleteColaborador(id);
  },

  async listarFolhas(mesReferencia?: string): Promise<FolhaAula[]> {
    try {
      const response = await apiClient.get<FolhaAula[]>('/folha-aulas', { params: { mesReferencia } });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Local fallback
    }
    let list = fallbackStorage.getFolhas();
    if (mesReferencia) {
      list = list.filter(f => f.mesReferencia === mesReferencia);
    }
    return list;
  },

  async salvarFolha(data: Partial<FolhaAula>): Promise<FolhaAula> {
    try {
      const response = await apiClient.post<FolhaAula>('/folha-aulas', data);
      fallbackStorage.saveFolha(response.data);
      return response.data;
    } catch {
      return fallbackStorage.saveFolha(data);
    }
  },

  async atualizarStatusFolha(
    id: number,
    status: StatusFolha,
    dadosPagamento?: {
      dataPagamento?: string;
      formaPagamento?: FormaPagamento;
      comprovanteUrl?: string;
      comprovanteNome?: string;
      comprovanteTipo?: 'FOTO' | 'ARQUIVO' | 'URL';
      lancamentoFinanceiroId?: number;
    }
  ): Promise<FolhaAula> {
    try {
      const response = await apiClient.patch<FolhaAula>(`/folha-aulas/${id}/status`, null, {
        params: { status },
      });
      fallbackStorage.updateFolhaStatus(id, status);
      return response.data;
    } catch {
      return fallbackStorage.updateFolhaStatus(id, status);
    }
  },

  async obterTetoOrcamentario(): Promise<TetoConfig> {
    const stored = localStorage.getItem('portofc_teto_config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    return {
      total: 300000.00,
      anual: 300000.00,
      mensal: 25000.00,
      diario: 833.33,
      duracaoMeses: 12,
    };
  },

  async atualizarTetoOrcamentario(teto: TetoConfig): Promise<TetoConfig> {
    localStorage.setItem('portofc_teto_config', JSON.stringify(teto));
    return teto;
  },
};
