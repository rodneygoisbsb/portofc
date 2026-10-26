import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, UserSession } from '../services/authService';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha?: string) => Promise<UserSession>;
  register: (nome: string, email: string, cargo: string, senha?: string) => Promise<{ pendingApproval: boolean; message: string }>;
  loginGoogle: (googleCredential?: string, email?: string) => Promise<UserSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (e) {
      console.warn('Erro ao restaurar sessão', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, senha?: string): Promise<UserSession> => {
    const session = await authService.login(email, senha);
    setUser(session);
    return session;
  };

  const register = async (nome: string, email: string, cargo: string, senha?: string): Promise<{ pendingApproval: boolean; message: string }> => {
    return await authService.register(nome, email, cargo, senha);
  };

  const loginGoogle = async (googleCredential?: string, email?: string): Promise<UserSession> => {
    const session = await authService.loginGoogle(googleCredential, email);
    setUser(session);
    return session;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
