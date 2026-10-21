import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { NavTab } from './components/layout/Sidebar';
import { DashboardModule } from './components/modules/dashboard/DashboardModule';
import { AlunosModule } from './components/modules/alunos/AlunosModule';
import { FrequenciaModule } from './components/modules/frequencia/FrequenciaModule';
import { EquipeModule } from './components/modules/equipe/EquipeModule';
import { FinanceiroModule } from './components/modules/financeiro/FinanceiroModule';
import { MateriaisModule } from './components/modules/materiais/MateriaisModule';
import { PrestacaoContasModule } from './components/modules/prestacao/PrestacaoContasModule';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

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

export default App;
