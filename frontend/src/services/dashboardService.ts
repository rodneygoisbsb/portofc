import { apiClient, isRemoteApiConfigured } from './api';
import { DashboardStats } from '../types';
import { fallbackStorage } from './storageFallback';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (isRemoteApiConfigured) {
      try {
        const response = await apiClient.get<DashboardStats>('/dashboard/stats');
        if (response.data && response.data.saldoDisponivel !== undefined) {
          const data = response.data;
          const fallback = fallbackStorage.getDashboardStats();
          // Se a API remota ainda retornar saldo negativo por ausência de lançamento de ENTRADA
          if ((!data.totalReceitasPagas || data.totalReceitasPagas === 0) && data.saldoDisponivel < 0) {
            return fallback;
          }
          return {
            ...data,
            orcamentoPrevisto: data.orcamentoPrevisto || fallback.orcamentoPrevisto || 120000,
          };
        }
      } catch (err) {
        console.warn('Dashboard remote API indisponível, usando cálculo dinâmico real:', err);
      }
    }
    return fallbackStorage.getDashboardStats();
  },
};
