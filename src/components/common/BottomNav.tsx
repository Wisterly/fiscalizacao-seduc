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
    <nav className="fixed left-2.5 right-2.5 bottom-2 sm:bottom-3 sm:left-4 sm:right-4 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:min-w-[560px] md:max-w-xl z-40 rounded-2xl sm:rounded-[22px] bg-gradient-to-b from-[#212a3a]/88 via-[#18202d]/92 to-[#101622]/96 backdrop-blur-2xl border border-white/[0.22] shadow-[0_12px_36px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.30)] px-2 sm:px-3 md:px-5 py-1.5 sm:py-2 transition-all duration-300 overflow-hidden">
      {/* Filete superior com reflexo cristalino de vidrochanfrado */}
      <div className="absolute top-0 inset-x-3 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
      
      {/* Reflexo vítreo suave no canto superior esquerdo (fiel à imagem de referência) */}
      <div className="absolute top-0 left-0 w-36 h-7 bg-gradient-to-br from-white/[0.12] to-transparent rounded-tl-2xl pointer-events-none" />

      {/* Grid com os 6 itens mantidos: Início, Vistoria, Orçamento, Rotas, Demandas, Galeria */}
      <div className="flex items-center justify-around w-full max-w-md md:max-w-full mx-auto relative z-10 gap-0.5 sm:gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id as NavTab)}
              className="flex-1 py-1 px-0.5 rounded-xl relative transition-all duration-200 active:scale-95 flex flex-col items-center justify-center group"
            >
              {/* Círculo com halo de luz dourada/âmbar suave idêntico à imagem */}
              {isActive && (
                <div className="absolute top-[3px] w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-b from-amber-400/35 via-amber-500/18 to-transparent blur-[2.5px] pointer-events-none animate-fadeIn" />
              )}

              <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8">
                <Icon
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-all duration-200 ${
                    isActive
                      ? 'stroke-[2] text-[#FBBF24] drop-shadow-[0_0_8px_rgba(251,191,36,0.65)]'
                      : 'stroke-[1.6] text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {/* Badge de pendências em Demandas */}
                {'badge' in tab && typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-3.5 px-0.5 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center border border-slate-900 shadow-glass-glow-orange animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Rótulo da aba */}
              <span
                className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'text-[#FBBF24] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'
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
