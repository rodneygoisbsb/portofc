import { apiClient, isRemoteApiConfigured } from './api';
import { fallbackStorage } from './storageFallback';

export type UserStatus = 'ATIVO' | 'PENDENTE' | 'RECUSADO';

export interface UserSession {
  token: string;
  id: number;
  nome: string;
  email: string;
  cargo: string;
  perfil: 'ADMIN' | 'GESTOR' | 'PROFESSOR';
  fotoUrl: string;
  status?: UserStatus;
  dataCadastro?: string;
}

export interface SolicitacaoCadastro {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  dataSolicitacao: string;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  dataAprovacao?: string;
  aprovadoPor?: string;
}

const INITIAL_SOLICITACOES: SolicitacaoCadastro[] = [
  {
    id: 1001,
    nome: "Lucas Silveira Castro",
    email: "lucas.castro@portofc.org.br",
    cargo: "Monitor(a) / Voluntário(a)",
    dataSolicitacao: "2026-10-26T14:30:00",
    status: "PENDENTE",
  },
  {
    id: 1002,
    nome: "Renata Vasconcelos",
    email: "renata.vasconcelos@portofc.org.br",
    cargo: "Preparador(a) Físico(a) / Fisioterapeuta",
    dataSolicitacao: "2026-10-25T11:20:00",
    status: "PENDENTE",
  }
];

export const authService = {
  getSolicitacoes(): SolicitacaoCadastro[] {
    try {
      const stored = localStorage.getItem('portofc_solicitacoes');
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    localStorage.setItem('portofc_solicitacoes', JSON.stringify(INITIAL_SOLICITACOES));
    return INITIAL_SOLICITACOES;
  },

  async login(email: string, senha?: string): Promise<UserSession> {
    const em = email.toLowerCase().trim();

    // Tentar backend remoto se estiver configurado
    if (isRemoteApiConfigured) {
      try {
        const response = await apiClient.post<UserSession>(
          '/auth/login',
          { email: em, senha, provider: 'LOCAL' },
          { timeout: 2000 }
        );
        if (response.data && response.data.token) {
          localStorage.setItem('portofc_auth_token', response.data.token);
          localStorage.setItem('portofc_user', JSON.stringify(response.data));
          return response.data;
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          throw new Error(err.response?.data?.message || 'Credenciais inválidas.');
        }
      }
    }

    // 1. Diretoria Executiva (Acesso Direto e Exclusivo)
    if (em.includes('tainara')) {
      const user: UserSession = {
        token: 'pfc_token_tainara',
        id: 100,
        nome: 'Tainara',
        email: em,
        cargo: 'Gestora Financeira & Prestação de Contas',
        perfil: 'GESTOR',
        fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'ATIVO',
      };
      localStorage.setItem('portofc_auth_token', user.token);
      localStorage.setItem('portofc_user', JSON.stringify(user));
      return user;
    }

    if (em.includes('nayara')) {
      const user: UserSession = {
        token: 'pfc_token_nayara',
        id: 101,
        nome: 'Nayara',
        email: em,
        cargo: 'Gerente Geral',
        perfil: 'ADMIN',
        fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        status: 'ATIVO',
      };
      localStorage.setItem('portofc_auth_token', user.token);
      localStorage.setItem('portofc_user', JSON.stringify(user));
      return user;
    }

    // 2. Professores Oficiais Preexistentes
    if (em.includes('ricardo')) {
      const user: UserSession = {
        token: 'pfc_token_ricardo',
        id: 1,
        nome: 'Prof. Ricardo Antunes Mendonça',
        email: em,
        cargo: 'Professor de Futebol de Base (Sub-7 e Sub-9)',
        perfil: 'PROFESSOR',
        fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: 'ATIVO',
      };
      localStorage.setItem('portofc_auth_token', user.token);
      localStorage.setItem('portofc_user', JSON.stringify(user));
      return user;
    }

    if (em.includes('marcelo')) {
      const user: UserSession = {
        token: 'pfc_token_marcelo',
        id: 2,
        nome: 'Prof. Marcelo Vasconcelos',
        email: em,
        cargo: 'Professor Técnico Principal (Sub-15 a Adulto)',
        perfil: 'PROFESSOR',
        fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        status: 'ATIVO',
      };
      localStorage.setItem('portofc_auth_token', user.token);
      localStorage.setItem('portofc_user', JSON.stringify(user));
      return user;
    }

    // 3. Verificação de Solicitações de Cadastro
    const solicitacoes = this.getSolicitacoes();
    const sol = solicitacoes.find(s => s.email.toLowerCase() === em);

    if (sol) {
      if (sol.status === 'PENDENTE') {
        throw new Error('Seu cadastro foi recebido e está aguardando autorização da diretoria (Tainara / Nayara). Você será liberado(a) assim que for aprovado(a)!');
      }
      if (sol.status === 'RECUSADO') {
        throw new Error('Sua solicitação de acesso não foi autorizada pela diretoria da ONG.');
      }
      if (sol.status === 'APROVADO') {
        const user: UserSession = {
          token: 'pfc_token_' + sol.id,
          id: sol.id,
          nome: sol.nome,
          email: sol.email,
          cargo: sol.cargo,
          perfil: sol.cargo.toLowerCase().includes('professor') ? 'PROFESSOR' : 'GESTOR',
          fotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          status: 'ATIVO',
        };
        localStorage.setItem('portofc_auth_token', user.token);
        localStorage.setItem('portofc_user', JSON.stringify(user));
        return user;
      }
    }

    // Se o usuário não existe nem está pendente
    throw new Error('E-mail não encontrado no sistema. Por favor, solicite seu acesso na aba "Criar Conta (Cadastro)".');
  },

  async register(nome: string, email: string, cargo: string, senha?: string): Promise<{ pendingApproval: boolean; message: string }> {
    const em = email.toLowerCase().trim();

    // Bloquear cargos executivos exclusivos de Tainara e Nayara
    if (cargo.includes('Gestora Financeira') || cargo.includes('Gerente Geral')) {
      throw new Error('Os cargos de Gestora Financeira e Gerente Geral são restritos e não estão disponíveis para cadastro público.');
    }

    const list = this.getSolicitacoes();
    const existing = list.find(s => s.email.toLowerCase() === em);
    if (existing && existing.status === 'PENDENTE') {
      return {
        pendingApproval: true,
        message: 'Você já possui uma solicitação de acesso em análise pela diretoria (Tainara / Nayara).',
      };
    }
    if (existing && existing.status === 'APROVADO') {
      throw new Error('Este e-mail já foi autorizado! Por favor, utilize a aba de login para entrar.');
    }

    const nova: SolicitacaoCadastro = {
      id: Date.now(),
      nome: nome.trim(),
      email: em,
      cargo: cargo.trim(),
      dataSolicitacao: new Date().toISOString(),
      status: 'PENDENTE',
    };

    list.unshift(nova);
    localStorage.setItem('portofc_solicitacoes', JSON.stringify(list));

    // Se houver backend remoto, registrar também
    if (isRemoteApiConfigured) {
      try {
        await apiClient.post('/auth/register', { nome, email: em, cargo, senha, provider: 'LOCAL' });
      } catch {
        // Fallback local
      }
    }

    return {
      pendingApproval: true,
      message: 'Cadastro realizado com sucesso! Aguardando autorização da diretoria (Tainara / Nayara) para liberar o seu acesso.',
    };
  },

  aprovarSolicitacao(id: number, aprovadoPor: string = 'Tainara'): SolicitacaoCadastro {
    const list = this.getSolicitacoes();
    const item = list.find(s => s.id === id);
    if (!item) throw new Error('Solicitação não encontrada');

    item.status = 'APROVADO';
    item.dataAprovacao = new Date().toISOString();
    item.aprovadoPor = aprovadoPor;
    localStorage.setItem('portofc_solicitacoes', JSON.stringify(list));

    // Adiciona automaticamente como colaborador na equipe
    fallbackStorage.saveColaborador({
      nome: item.nome,
      email: item.email,
      funcao: item.cargo,
      tipoContratacao: 'HORISTA',
      status: 'ATIVO',
      dataAdmissao: new Date().toISOString().split('T')[0],
    });

    return item;
  },

  recusarSolicitacao(id: number): SolicitacaoCadastro {
    const list = this.getSolicitacoes();
    const item = list.find(s => s.id === id);
    if (!item) throw new Error('Solicitação não encontrada');

    item.status = 'RECUSADO';
    localStorage.setItem('portofc_solicitacoes', JSON.stringify(list));
    return item;
  },

  async loginGoogle(googleCredential?: string, email?: string): Promise<UserSession> {
    const targetEmail = email || 'tainara@portofc.org.br';
    return this.login(targetEmail);
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

