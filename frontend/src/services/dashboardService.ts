import { apiClient, isRemoteApiConfigured } from './api';
import { DashboardStats } from '../types';
import { fallbackStorage } from './storageFallback';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (!isRemoteApiConfigured) {
      return fallbackStorage.getDashboardStats();
    }
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      if (response.data && response.data.saldoDisponivel !== undefined) {
        return response.data;
      }
      return fallbackStorage.getDashboardStats();
    } catch {
      return fallbackStorage.getDashboardStats();
    }
  },
};

