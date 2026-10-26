import { apiClient } from './api';

export interface UserSession {
  token: string;
  id: number;
  nome: string;
  email: string;
  cargo: string;
  perfil: 'ADMIN' | 'GESTOR' | 'PROFESSOR';
  fotoUrl: string;
}

export const authService = {
  async login(email: string, senha?: string): Promise<UserSession> {
    const response = await apiClient.post<UserSession>('/auth/login', {
      email,
      senha,
      provider: 'LOCAL',
    });
    if (response.data.token) {
      localStorage.setItem('portofc_auth_token', response.data.token);
      localStorage.setItem('portofc_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  async loginGoogle(googleCredential?: string, email?: string): Promise<UserSession> {
    const response = await apiClient.post<UserSession>('/auth/google', {
      email: email || 'tainara@portofc.org.br',
      googleToken: googleCredential,
      provider: 'GOOGLE',
    });
    if (response.data.token) {
      localStorage.setItem('portofc_auth_token', response.data.token);
      localStorage.setItem('portofc_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('portofc_auth_token');
    localStorage.removeItem('portofc_user');
  },

  getCurrentUser(): UserSession | null {
    const stored = localStorage.getItem('portofc_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
};
