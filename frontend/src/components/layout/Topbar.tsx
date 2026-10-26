import React, { useState } from 'react';
import { Search, Bell, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onSearch?: (term: string) => void;
  onSelectProfile?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onSearch, onSelectProfile }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Presença Baixa (< 75%)', desc: '3 alunos necessitam de atenção pedagógica.', type: 'warning' },
    { id: 2, title: 'Contas a Pagar', desc: 'Honorários de contabilidade vencem em 8 dias.', type: 'info' },
    { id: 3, title: 'Carga de Dados Ativa', desc: 'Massa inicial de 17 alunos e 15 transações carregada.', type: 'success' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar alunos, colaboradores, despesas..."
          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 relative transition-colors cursor-pointer"
          >
            <Bell size={19} />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white absolute top-2 right-2" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notificações</span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  3 novas
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-50 flex items-start gap-3 transition-colors">
                    <div className="mt-0.5">
                      {n.type === 'warning' ? (
                        <AlertTriangle size={16} className="text-amber-500" />
                      ) : (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <button
            type="button"
            onClick={onSelectProfile}
            className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer group"
            title="Clique para editar seu perfil e senha"
          >
            {user?.fotoUrl ? (
              <img
                src={user.fotoUrl}
                alt={user.nome}
                className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.nome ? user.nome.substring(0, 2).toUpperCase() : 'FC'}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-none group-hover:text-blue-700 transition-colors">
                {user?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-slate-400 mt-1 truncate max-w-[160px]">{user?.cargo || 'PORTO FC'}</p>
            </div>
          </button>
          <button
            title="Sair do Sistema"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
