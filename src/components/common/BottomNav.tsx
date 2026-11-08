import React from 'react';
import { Home, ClipboardList, CheckSquare, Image as GalleryIcon, Settings } from 'lucide-react';

export type NavTab = 'inicio' | 'vistorias' | 'demandas' | 'galeria' | 'config';

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
    { id: 'vistorias', label: 'Vistorias', icon: ClipboardList },
    { id: 'demandas', label: 'Demandas', icon: CheckSquare, badge: pendenciasCount },
    { id: 'galeria', label: 'Galeria', icon: GalleryIcon },
    { id: 'config', label: 'Configurações', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1424]/85 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl relative transition-all duration-200 active-press ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Indicador sutil de aba ativa */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-cyan-400 shadow-glass-glow-turq" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.3]' : 'scale-100 stroke-[1.8]'
                  }`}
                />
                {'badge' in tab && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center border border-slate-900 shadow-glass-glow-orange">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
