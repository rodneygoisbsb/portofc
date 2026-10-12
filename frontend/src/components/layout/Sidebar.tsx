import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Briefcase,
  DollarSign,
  Shirt,
  FileSpreadsheet,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { USE_MOCKS } from '../../services/api';

export type NavTab =
  | 'dashboard'
  | 'alunos'
  | 'frequencia'
  | 'equipe'
  | 'financeiro'
  | 'materiais'
  | 'prestacao';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems = [
    { id: 'dashboard' as NavTab, label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'alunos' as NavTab, label: 'Alunos & Turmas', icon: Users },
    { id: 'frequencia' as NavTab, label: 'Chamada & Frequência', icon: CalendarCheck },
    { id: 'equipe' as NavTab, label: 'Equipe & Folha', icon: Briefcase },
    { id: 'financeiro' as NavTab, label: 'Financeiro & Orçamento', icon: DollarSign },
    { id: 'materiais' as NavTab, label: 'Materiais & Uniformes', icon: Shirt },
    { id: 'prestacao' as NavTab, label: 'Prestação de Contas', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
          <ShieldCheck size={24} className="stroke-[2.2]" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">
            PORTO <span className="text-blue-700">FC</span>
          </h1>
          <span className="text-xs font-medium text-slate-400">Escola & ONG Esportiva</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-50/80 text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                size={19}
                className={`transition-colors ${isActive ? 'text-blue-700' : 'text-slate-400'}`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mode & Storage Indicator */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 m-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <Database size={15} className={USE_MOCKS ? 'text-amber-600' : 'text-emerald-600'} />
          <span className="text-xs font-semibold text-slate-800">
            {USE_MOCKS ? 'Modo Demonstração (Mocks)' : 'Conectado ao Back-end'}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          {USE_MOCKS
            ? 'Dados locais ativos com suporte a fallback imediato.'
            : 'Sincronizado com a API Spring Boot em tempo real.'}
        </p>
      </div>
    </aside>
  );
};
