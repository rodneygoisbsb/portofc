import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { NavTab } from './components/layout/Sidebar';
import { DashboardModule } from './components/modules/dashboard/DashboardModule';
import { AlunosModule } from './components/modules/alunos/AlunosModule';
import { FrequenciaModule } from './components/modules/frequencia/FrequenciaModule';
import { EquipeModule } from './components/modules/equipe/EquipeModule';
import { FinanceiroModule } from './components/modules/financeiro/FinanceiroModule';
import { MateriaisModule } from './components/modules/materiais/MateriaisModule';
import { PrestacaoContasModule } from './components/modules/prestacao/PrestacaoContasModule';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Carregando plataforma PORTO FC...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleGlobalSearch = (term: string) => {
    if (term.trim() && currentTab === 'dashboard') {
      setCurrentTab('alunos');
    }
  };

  return (
    <Layout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      onGlobalSearch={handleGlobalSearch}
    >
      {currentTab === 'dashboard' && <DashboardModule />}
      {currentTab === 'alunos' && <AlunosModule />}
      {currentTab === 'frequencia' && <FrequenciaModule />}
      {currentTab === 'equipe' && <EquipeModule />}
      {currentTab === 'financeiro' && <FinanceiroModule />}
      {currentTab === 'materiais' && <MateriaisModule />}
      {currentTab === 'prestacao' && <PrestacaoContasModule />}
    </Layout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
