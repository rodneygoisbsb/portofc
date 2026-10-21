import { apiClient, USE_MOCKS } from './api';
import { LancamentoFinanceiro, OrcamentoMes, StatusFinanceiro, TipoLancamento } from '../types';
import { MockStorage } from '../mocks/mockStorage';
import { INITIAL_ORCAMENTOS } from '../mocks/mockData';

export const financeiroService = {
  async listarLancamentos(tipo?: TipoLancamento, status?: StatusFinanceiro, categoria?: string): Promise<LancamentoFinanceiro[]> {
    if (USE_MOCKS) {
      return MockStorage.getLancamentos(tipo, status, categoria);
    }
    try {
      const response = await apiClient.get<LancamentoFinanceiro[]>('/financeiro', {
        params: { tipo, status, categoria },
      });
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao listar lançamentos', error);
      return MockStorage.getLancamentos(tipo, status, categoria);
    }
  },

  async salvarLancamento(data: Partial<LancamentoFinanceiro>): Promise<LancamentoFinanceiro> {
    if (USE_MOCKS) {
      return MockStorage.saveLancamento(data);
    }
    try {
      if (data.id) {
        const response = await apiClient.put<LancamentoFinanceiro>(`/financeiro/${data.id}`, data);
        return response.data;
      } else {
        const response = await apiClient.post<LancamentoFinanceiro>('/financeiro', data);
        return response.data;
      }
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao salvar lançamento', error);
      return MockStorage.saveLancamento(data);
    }
  },

  async deletarLancamento(id: number): Promise<void> {
    if (USE_MOCKS) {
      MockStorage.deleteLancamento(id);
      return;
    }
    try {
      await apiClient.delete(`/financeiro/${id}`);
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao deletar lançamento', error);
      MockStorage.deleteLancamento(id);
    }
  },

  async obterOrcamento(): Promise<OrcamentoMes[]> {
    if (USE_MOCKS) {
      return INITIAL_ORCAMENTOS;
    }
    try {
      const response = await apiClient.get<OrcamentoMes[]>('/financeiro/orcamento');
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Fallback para mock ao obter orçamento', error);
      return INITIAL_ORCAMENTOS;
    }
  },
};
