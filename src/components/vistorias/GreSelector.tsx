import React from 'react';
import { MapPin, Check } from 'lucide-react';
import { GRE, Escola } from '../../types';

interface GreSelectorProps {
  gres: GRE[];
  schools: Escola[];
  selectedGreId: string | null;
  onSelectGre: (gre: GRE) => void;
  onToggleFavorite?: (greId: string) => void;
}

export const GreSelector: React.FC<GreSelectorProps> = ({
  gres,
  schools,
  selectedGreId,
  onSelectGre
}) => {
  // Ordena rigorosamente de 1 a 21
  const sortedGres = [...gres].sort((a, b) => a.numero - b.numero);

  // Formata o número da GRE com 2 dígitos (ex: 01ª GRE)
  const formatGreNumber = (num: number) => {
    return `${String(num).padStart(2, '0')}ª GRE`;
  };

  // Nome simplificado da sede para caber com elegância no card compacto
  const getSedeDisplay = (gre: GRE) => {
    if (gre.numero === 4) return 'Teresina Sul';
    if (gre.numero === 18) return 'Teresina Norte';
    if (gre.numero === 19) return 'Teresina Sudeste';
    if (gre.numero === 20) return 'Teresina';
    if (gre.numero === 21) return 'Teresina';
    return gre.sede;
  };

  return (
    <div className="w-full flex flex-col justify-start select-none">
      {/* Título Oficial Superior: 1. Selecionar a GRE */}
      <div className="flex items-center gap-2 mb-3 px-0.5">
        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
          <MapPin className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
        </div>
        <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none">
          1. Selecionar a GRE
        </h2>
        <span className="ml-auto text-[10px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
          21 Regiões
        </span>
      </div>

      {/* Grid 5x5 Compacto das 21 GREs (Visível 100% sem scroll no celular) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {sortedGres.map((gre) => {
          const isSelected = selectedGreId === gre.id;
          const sedeText = getSedeDisplay(gre);

          return (
            <button
              key={gre.id}
              type="button"
              onClick={() => onSelectGre(gre)}
              aria-label={`${formatGreNumber(gre.numero)} - ${sedeText}`}
              className={`relative h-[66px] xs:h-[70px] sm:h-[76px] rounded-xl border flex flex-col justify-between items-center p-1 sm:p-1.5 transition-all duration-150 active:scale-95 overflow-hidden group text-center cursor-pointer ${
                isSelected
                  ? 'bg-[#151D2C] border-amber-500 ring-2 ring-amber-500/90 shadow-[0_0_16px_rgba(245,158,11,0.45)]'
                  : 'bg-[#111723]/95 border-white/[0.09] hover:border-amber-500/50 hover:bg-[#161F2E]'
              }`}
            >
              {/* Selo circular de Seleção (igual à 08ª GRE do print) */}
              {isSelected && (
                <div className="absolute top-1 right-1 z-10 w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md ring-1 ring-amber-300">
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </div>
              )}

              {/* Topo do Card: Miniatura da Logo Oficial SEDUC */}
              <div className="w-full flex items-center justify-center pt-0.5 flex-shrink-0">
                <img
                  src="/logo-seduc-piaui.png"
                  alt="SEDUC"
                  className="h-2.5 xs:h-3 sm:h-3.5 object-contain max-w-[88%] filter drop-shadow opacity-85 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>

              {/* Miolo do Card: Número da GRE + Município Sede */}
              <div className="w-full flex flex-col items-center justify-center my-auto px-0.5">
                <span className="text-[10px] xs:text-[11px] sm:text-xs font-black text-white tracking-tight leading-tight">
                  {formatGreNumber(gre.numero)}
                </span>
                <span className="text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] text-slate-300 font-medium leading-tight truncate w-full mt-0.5">
                  {sedeText}
                </span>
              </div>

              {/* Base do Card: Efeito de Luz / Onda Neon Laranja Translúcida */}
              <div className="w-full h-3 sm:h-3.5 relative overflow-hidden pointer-events-none -mb-0.5 flex-shrink-0">
                {/* Brilho de fundo suave */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/25 via-amber-500/10 to-transparent opacity-80" />
                
                {/* Onda luminosa vítrea */}
                <svg
                  viewBox="0 0 100 30"
                  preserveAspectRatio="none"
                  className="absolute bottom-0 w-full h-full opacity-90"
                >
                  <path
                    d="M0,30 Q50,2 100,30"
                    fill="none"
                    stroke={isSelected ? '#F59E0B' : '#F97316'}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
