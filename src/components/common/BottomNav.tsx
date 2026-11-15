import React from 'react';
import {
  Home,
  Map,
  ClipboardList,
  Navigation,
  CheckSquare,
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
  // 7 Abas principais perfeitamente equilibradas e ergonômicas no celular
  const tabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'vistorias', label: 'Vistoria', icon: Map },
    { id: 'orcamentos', label: 'Orçamento', icon: ClipboardList },
    { id: 'rotas', label: 'Rotas', icon: Navigation },
    { id: 'demandas', label: 'Demandas', icon: CheckSquare, badge: pendenciasCount },
    { id: 'galeria', label: 'Galeria', icon: GalleryIcon },
    { id: 'config', label: 'Ajustes', icon: Settings },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[620px] md:max-w-2xl md:rounded-full z-40 bg-[#0A162D]/95 md:bg-[#0A162D]/95 backdrop-blur-3xl border-t md:border border-cyan-400/35 shadow-[0_-10px_35px_rgba(6,182,212,0.22),0_-2px_10px_rgba(0,0,0,0.8)] px-1 sm:px-2 md:px-5 py-1.5 md:py-2 pb-safe transition-all duration-300 overflow-hidden">
      {/* Filete superior com brilho neon turquesa / efeito vítreo com vida */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/90 to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-12 h-4 bg-gradient-to-b from-cyan-400/15 to-transparent rounded-full pointer-events-none blur-sm" />

      {/* Grid de 7 abas com encaixe ergonômico no mobile e desktop */}
      <div className="flex items-center justify-around w-full max-w-lg md:max-w-full mx-auto relative z-10 gap-0.5 sm:gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as NavTab)}
              className={`flex-1 py-1 px-1 sm:px-2 rounded-2xl relative transition-all duration-200 active-press flex flex-col items-center justify-center ${
                isActive
                  ? 'text-cyan-200 font-extrabold bg-gradient-to-b from-cyan-500/25 via-cyan-500/15 to-transparent border border-cyan-400/40 shadow-[0_0_16px_rgba(6,182,212,0.35)] scale-[1.05]'
                  : 'text-slate-300 hover:text-white font-medium hover:bg-white/[0.04]'
              }`}
            >
              {/* Indicador de iluminação neon no topo do botão ativo */}
              {isActive && (
                <span className="absolute -top-1 w-4 h-1 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
              )}

              <div className="relative">
                <Icon
                  className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4] text-cyan-300 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'scale-100 stroke-[1.8] text-slate-300'
                  }`}
                />
                {'badge' in tab && typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center border border-slate-900 shadow-glass-glow-orange animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[9.5px] sm:text-[10px] mt-0.5 tracking-tight font-bold whitespace-nowrap ${
                isActive ? 'text-cyan-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
