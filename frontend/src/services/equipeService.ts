import { apiClient, USE_MOCKS } from './api';
import { Colaborador, FolhaAula, FormaPagamento, StatusFolha, TetoConfig } from '../types';
import { MockStorage } from '../mocks/mockStorage';

export const equipeService = {
  async listarColaboradores(busca?: string): Promise<Colaborador[]> {
    if (USE_MOCKS) {
      return MockStorage.getColaboradores(busca);
    }
    try {
      const response = await apiClient.get<Colaborador[]>('/colaboradores', { params: { busca } });
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao listar colaboradores', error);
      return MockStorage.getColaboradores(busca);
    }
  },

  async salvarColaborador(data: Partial<Colaborador>): Promise<Colaborador> {
    if (USE_MOCKS) {
      return MockStorage.saveColaborador(data);
    }
    try {
      if (data.id) {
        const response = await apiClient.put<Colaborador>(`/colaboradores/${data.id}`, data);
        return response.data;
      } else {
        const response = await apiClient.post<Colaborador>('/colaboradores', data);
        return response.data;
      }
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao salvar colaborador', error);
      return MockStorage.saveColaborador(data);
    }
  },

  async deletarColaborador(id: number): Promise<void> {
    if (USE_MOCKS) {
      MockStorage.deleteColaborador(id);
      return;
    }
    try {
      await apiClient.delete(`/colaboradores/${id}`);
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao deletar colaborador', error);
      MockStorage.deleteColaborador(id);
    }
  },

  async listarFolhas(mesReferencia?: string): Promise<FolhaAula[]> {
    if (USE_MOCKS) {
      return MockStorage.getFolhas(mesReferencia);
    }
    try {
      const response = await apiClient.get<FolhaAula[]>('/folha-aulas', { params: { mesReferencia } });
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao listar folhas', error);
      return MockStorage.getFolhas(mesReferencia);
    }
  },

  async salvarFolha(data: Partial<FolhaAula>): Promise<FolhaAula> {
    if (USE_MOCKS) {
      return MockStorage.saveFolha(data);
    }
    try {
      const response = await apiClient.post<FolhaAula>('/folha-aulas', data);
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao salvar folha', error);
      return MockStorage.saveFolha(data);
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
    if (USE_MOCKS) {
      return MockStorage.updateFolhaStatus(id, status, dadosPagamento);
    }
    try {
      const response = await apiClient.patch<FolhaAula>(`/folha-aulas/${id}/status`, {
        status,
        ...dadosPagamento,
      });
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao atualizar status da folha', error);
      return MockStorage.updateFolhaStatus(id, status, dadosPagamento);
    }
  },

  async obterTetoOrcamentario(): Promise<TetoConfig> {
    return MockStorage.getTetoOrcamentario();
  },

  async atualizarTetoOrcamentario(teto: TetoConfig): Promise<TetoConfig> {
    return MockStorage.setTetoOrcamentario(teto);
  },
};
