import React from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Topbar } from './Topbar';

interface LayoutProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  children: React.ReactNode;
  onGlobalSearch?: (term: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  onGlobalSearch,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar currentTab={currentTab} onSelectTab={onSelectTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onSearch={onGlobalSearch} />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
