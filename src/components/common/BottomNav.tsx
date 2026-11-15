import React from 'react';
import {
  Home,
  Map,
  ClipboardList,
  TrendingUp,
  Navigation,
  CheckSquare,
  FileSearch,
  Image as GalleryIcon,
  Settings
} from 'lucide-react';

export type NavTab =
  | 'inicio'
  | 'vistorias'
  | 'orcamentos'
  | 'medicoes'
  | 'rotas'
  | 'demandas'
  | 'processos'
  | 'galeria'
  | 'config';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  pendenciasCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  pendenciasCount = 0
}) => {
  const tabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'vistorias', label: 'Vistorias', icon: Map },
    { id: 'orcamentos', label: 'Orçamentos', icon: ClipboardList },
    { id: 'medicoes', label: 'Medições', icon: TrendingUp },
    { id: 'rotas', label: 'Rotas', icon: Navigation },
    { id: 'demandas', label: 'Demandas', icon: CheckSquare, badge: pendenciasCount },
    { id: 'processos', label: 'Processos', icon: FileSearch },
    { id: 'galeria', label: 'Galeria', icon: GalleryIcon },
    { id: 'config', label: 'Ajustes', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[680px] md:max-w-4xl md:rounded-full md:border md:border-white/10 md:shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-40 bg-[#0D1424]/90 md:bg-[#0D1424]/95 backdrop-blur-2xl border-t border-white/[0.08] px-1 md:px-4 py-1 md:py-1.5 pb-safe transition-all duration-300">
      <div className="flex items-center overflow-x-auto no-scrollbar justify-start md:justify-around w-full max-w-full mx-auto gap-0.5 sm:gap-1 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1 px-2 sm:px-2.5 rounded-xl relative transition-all duration-200 active-press shrink-0 ${
                isActive
                  ? 'text-cyan-400 font-bold bg-white/[0.06] md:bg-transparent'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Indicador de aba ativa */}
              {isActive && (
                <span className="absolute -top-1 w-5 h-1 rounded-full bg-cyan-400 shadow-glass-glow-turq" />
              )}

              <div className="relative">
                <Icon
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.3]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {'badge' in tab && typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[14px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[8px] font-bold flex items-center justify-center border border-slate-900 shadow-glass-glow-orange">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[9px] sm:text-[10px] mt-0.5 tracking-tight whitespace-nowrap ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
