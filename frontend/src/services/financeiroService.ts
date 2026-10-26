import { apiClient } from './api';
import { LancamentoFinanceiro, OrcamentoMes, StatusFinanceiro, TipoLancamento } from '../types';

export const financeiroService = {
  async listarLancamentos(tipo?: TipoLancamento, status?: StatusFinanceiro, categoria?: string): Promise<LancamentoFinanceiro[]> {
    const response = await apiClient.get<LancamentoFinanceiro[]>('/financeiro', {
      params: { tipo, status, categoria: categoria === 'TODAS' ? undefined : categoria },
    });
    return response.data;
  },

  async salvarLancamento(data: Partial<LancamentoFinanceiro>): Promise<LancamentoFinanceiro> {
    if (data.id) {
      const response = await apiClient.put<LancamentoFinanceiro>(`/financeiro/${data.id}`, data);
      return response.data;
    } else {
      const response = await apiClient.post<LancamentoFinanceiro>('/financeiro', data);
      return response.data;
    }
  },

  async deletarLancamento(id: number): Promise<void> {
    await apiClient.delete(`/financeiro/${id}`);
  },

  async obterOrcamento(): Promise<OrcamentoMes[]> {
    const response = await apiClient.get<OrcamentoMes[]>('/financeiro/orcamento');
    return response.data;
  },
};
