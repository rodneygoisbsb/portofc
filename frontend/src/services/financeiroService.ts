import { apiClient } from './api';
import { LancamentoFinanceiro, OrcamentoMes, StatusFinanceiro, TipoLancamento } from '../types';
import { fallbackStorage } from './storageFallback';

export const financeiroService = {
  async listarLancamentos(tipo?: TipoLancamento, status?: StatusFinanceiro, categoria?: string): Promise<LancamentoFinanceiro[]> {
    try {
      const response = await apiClient.get<LancamentoFinanceiro[]>('/financeiro', {
        params: { tipo, status, categoria: categoria === 'TODAS' ? undefined : categoria },
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Backend inacessível, usar dados locais
    }
    let list = fallbackStorage.getLancamentos();
    if (tipo) list = list.filter(l => l.tipo === tipo);
    if (status) list = list.filter(l => l.status === status);
    if (categoria && categoria !== 'TODAS') list = list.filter(l => l.categoria === categoria);
    return list;
  },

  async salvarLancamento(data: Partial<LancamentoFinanceiro>): Promise<LancamentoFinanceiro> {
    try {
      if (data.id) {
        const response = await apiClient.put<LancamentoFinanceiro>(`/financeiro/${data.id}`, data);
        fallbackStorage.saveLancamento(response.data);
        return response.data;
      } else {
        const response = await apiClient.post<LancamentoFinanceiro>('/financeiro', data);
        fallbackStorage.saveLancamento(response.data);
        return response.data;
      }
    } catch {
      return fallbackStorage.saveLancamento(data);
    }
  },

  async deletarLancamento(id: number): Promise<void> {
    try {
      await apiClient.delete(`/financeiro/${id}`);
    } catch {
      // Local fallback
    }
    fallbackStorage.deleteLancamento(id);
  },

  async obterOrcamento(): Promise<OrcamentoMes[]> {
    try {
      const response = await apiClient.get<OrcamentoMes[]>('/financeiro/orcamento');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Local fallback
    }
    return fallbackStorage.getOrcamentos();
  },
};

