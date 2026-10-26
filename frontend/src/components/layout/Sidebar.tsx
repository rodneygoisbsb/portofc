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
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'alunos'
  | 'frequencia'
  | 'equipe'
  | 'financeiro'
  | 'materiais'
  | 'prestacao'
  | 'perfil';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const menuItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'financeiro' as NavTab, label: 'Financeiro', icon: DollarSign },
    { id: 'alunos' as NavTab, label: 'Alunos', icon: Users },
    { id: 'frequencia' as NavTab, label: 'Frequência Diária', icon: CalendarCheck },
    { id: 'equipe' as NavTab, label: 'Equipe', icon: Briefcase },
    { id: 'materiais' as NavTab, label: 'Recursos', icon: Shirt },
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

    </aside>
  );
};
