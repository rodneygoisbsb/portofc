import { apiClient, USE_MOCKS } from './api';
import { DashboardStats } from '../types';
import { MockStorage } from '../mocks/mockStorage';

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    if (USE_MOCKS) {
      return MockStorage.getDashboardStats();
    }
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.warn('[PORTO FC] Backend offline ou indisponível. Usando dados fictícios locais (Fallback).', error);
      return MockStorage.getDashboardStats();
    }
  },
};
