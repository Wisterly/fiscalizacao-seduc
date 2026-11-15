import React from 'react';
import {
  Home,
  Map,
  ClipboardList,
  Navigation,
  CheckSquare,
  Image as GalleryIcon
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
  // 6 Abas principais com máxima ergonomia e espaçamento balanceado
  // (Ajustes fica exclusivamente no menu superior de 3 pontinhos/linhas)
  const tabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'vistorias', label: 'Vistoria', icon: Map },
    { id: 'orcamentos', label: 'Orçamento', icon: ClipboardList },
    { id: 'rotas', label: 'Rotas', icon: Navigation },
    { id: 'demandas', label: 'Demandas', icon: CheckSquare, badge: pendenciasCount },
    { id: 'galeria', label: 'Galeria', icon: GalleryIcon },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[580px] md:max-w-xl md:rounded-3xl z-40 bg-[#0B111E]/92 md:bg-[#0B111E]/95 backdrop-blur-2xl border-t md:border border-white/[0.18] shadow-[0_-10px_35px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.14)] px-2 sm:px-3 md:px-5 py-2 md:py-2.5 pb-safe transition-all duration-300 overflow-hidden">
      {/* Filete superior vítreo fino com reflexo suave */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-10 h-3 bg-gradient-to-b from-amber-400/10 to-transparent rounded-full pointer-events-none blur-sm" />

      {/* Grid com os 6 itens confortavelmente distribuídos */}
      <div className="flex items-center justify-around w-full max-w-md md:max-w-full mx-auto relative z-10 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as NavTab)}
              className="flex-1 py-1 px-1 rounded-2xl relative transition-all duration-200 active-press flex flex-col items-center justify-center group"
            >
              {/* Halo circular luminoso âmbar/dourado suave (efeito da imagem de referência) */}
              {isActive && (
                <div className="absolute -top-1 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-b from-amber-400/30 via-amber-500/15 to-transparent blur-[3px] pointer-events-none animate-fadeIn" />
              )}

              <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8">
                <Icon
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-200 ${
                    isActive
                      ? 'scale-110 stroke-[2.2] text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'scale-100 stroke-[1.6] text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {/* Badge de pendências em Demandas */}
                {'badge' in tab && typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[15px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center border border-slate-900 shadow-glass-glow-orange animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Rótulo da aba */}
              <span
                className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'text-amber-300 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]'
                    : 'text-slate-400 group-hover:text-slate-300 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
