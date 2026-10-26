import { apiClient } from './api';
import { Colaborador, FolhaAula, FormaPagamento, StatusFolha, TetoConfig } from '../types';

export const equipeService = {
  async listarColaboradores(busca?: string): Promise<Colaborador[]> {
    const response = await apiClient.get<Colaborador[]>('/colaboradores', { params: { busca } });
    return response.data;
  },

  async salvarColaborador(data: Partial<Colaborador>): Promise<Colaborador> {
    if (data.id) {
      const response = await apiClient.put<Colaborador>(`/colaboradores/${data.id}`, data);
      return response.data;
    } else {
      const response = await apiClient.post<Colaborador>('/colaboradores', data);
      return response.data;
    }
  },

  async deletarColaborador(id: number): Promise<void> {
    await apiClient.delete(`/colaboradores/${id}`);
  },

  async listarFolhas(mesReferencia?: string): Promise<FolhaAula[]> {
    const response = await apiClient.get<FolhaAula[]>('/folha-aulas', { params: { mesReferencia } });
    return response.data;
  },

  async salvarFolha(data: Partial<FolhaAula>): Promise<FolhaAula> {
    const response = await apiClient.post<FolhaAula>('/folha-aulas', data);
    return response.data;
  },

  async atualizarStatusFolha(
    id: number,
    status: StatusFolha,
    _dadosPagamento?: {
      dataPagamento?: string;
      formaPagamento?: FormaPagamento;
      comprovanteUrl?: string;
      comprovanteNome?: string;
      comprovanteTipo?: 'FOTO' | 'ARQUIVO' | 'URL';
      lancamentoFinanceiroId?: number;
    }
  ): Promise<FolhaAula> {
    const response = await apiClient.patch<FolhaAula>(`/folha-aulas/${id}/status`, null, {
      params: { status },
    });
    return response.data;
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
