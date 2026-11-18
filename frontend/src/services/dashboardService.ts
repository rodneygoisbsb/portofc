import { apiClient, isRemoteApiConfigured } from './api';
import { DashboardStats } from '../types';
import { fallbackStorage } from './storageFallback';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (isRemoteApiConfigured) {
      try {
        const response = await apiClient.get<DashboardStats>('/dashboard/stats');
        if (response.data && response.data.saldoDisponivel !== undefined) {
          return response.data;
        }
      } catch (err) {
        console.warn('Dashboard remote API indisponível, usando cálculo dinâmico real:', err);
      }
    }
    return fallbackStorage.getDashboardStats();
  },
};
