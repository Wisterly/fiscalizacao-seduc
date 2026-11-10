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

  // Nome oficial da sede corrigido e ajustado conforme orientação SEDUC
  const getSedeName = (gre: GRE) => {
    if (gre.numero === 4) return 'Teresina Sul';
    if (gre.numero === 9) return 'Picos';
    if (gre.numero === 10) return 'Floriano';
    if (gre.numero === 11) return 'Uruçuí';
    if (gre.numero === 12) return 'São João do Piauí';
    if (gre.numero === 13) return 'São Raimundo Nonato';
    if (gre.numero === 18) return 'Teresina Norte';
    if (gre.numero === 19) return 'Teresina Sudeste';
    if (gre.numero === 20) return 'Teresina';
    if (gre.numero === 21) return 'Teresina';
    return gre.sede;
  };

  // Quebra de linha inteligente para leitura completa sem cortes ou reticências
  const renderSedeFormatted = (sede: string) => {
    if (sede === 'São João do Piauí') {
      return (
        <span className="block leading-[1.02]">
          São João<br />do Piauí
        </span>
      );
    }
    if (sede === 'São Raimundo Nonato') {
      return (
        <span className="block leading-[1.02]">
          São Raimundo<br />Nonato
        </span>
      );
    }
    if (sede === 'Valença do Piauí') {
      return (
        <span className="block leading-[1.02]">
          Valença<br />do Piauí
        </span>
      );
    }
    if (sede === 'Teresina Sudeste') {
      return (
        <span className="block leading-[1.02]">
          Teresina<br />Sudeste
        </span>
      );
    }
    if (sede === 'Teresina Norte') {
      return (
        <span className="block leading-[1.02]">
          Teresina<br />Norte
        </span>
      );
    }
    if (sede === 'Teresina Sul') {
      return (
        <span className="block leading-[1.02]">
          Teresina<br />Sul
        </span>
      );
    }
    if (sede === 'Campo Maior') {
      return (
        <span className="block leading-[1.02]">
          Campo<br />Maior
        </span>
      );
    }
    if (sede === 'Bom Jesus') {
      return (
        <span className="block leading-[1.02]">
          Bom<br />Jesus
        </span>
      );
    }
    return <span className="block leading-[1.02]">{sede}</span>;
  };

  return (
    <div className="w-full flex flex-col justify-start select-none">
      {/* Título Superior: 1. Selecionar a GRE */}
      <div className="flex items-center gap-2 mb-2.5 px-0.5">
        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
          <MapPin className="w-3.5 h-3.5 text-amber-400 stroke-[2.5]" />
        </div>
        <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none">
          1. Selecionar a GRE
        </h2>
        <span className="ml-auto text-[10px] font-semibold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          21 Regiões
        </span>
      </div>

      {/* Grid 5x5 com os novos Cards oficiais cósmicos tecnológicos */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {sortedGres.map((gre) => {
          const isSelected = selectedGreId === gre.id;
          const sedeText = getSedeName(gre);

          return (
            <button
              key={gre.id}
              type="button"
              onClick={() => onSelectGre(gre)}
              aria-label={`${formatGreNumber(gre.numero)} - ${sedeText}`}
              className={`relative h-[76px] xs:h-[82px] sm:h-[88px] rounded-2xl flex flex-col justify-between items-center p-1 sm:p-1.5 transition-all duration-150 active:scale-95 overflow-hidden group text-center cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#111C35] via-[#0B1428] to-[#060B18] border-2 border-amber-400 ring-2 ring-amber-400/90 shadow-[0_0_20px_rgba(251,191,36,0.6),inset_0_0_15px_rgba(251,191,36,0.25)] scale-[1.02]'
                  : 'bg-gradient-to-b from-[#0C152B] via-[#081022] to-[#040814] border border-amber-500/35 hover:border-amber-400/70 hover:bg-[#101C38] shadow-[0_0_12px_rgba(245,158,11,0.18),inset_0_0_10px_rgba(245,158,11,0.08)]'
              }`}
            >
              {/* Efeito de Halo de Fogo / Anel Neon Superior e Inferior */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-inset ring-amber-400/20 group-hover:ring-amber-400/50" />
              <div className="absolute top-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 inset-x-2 h-[1px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent pointer-events-none" />

              {/* Selo de Seleção Ativa no Canto Superior Direito */}
              {isSelected && (
                <div className="absolute top-1 right-1 z-20 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md ring-1 ring-amber-200">
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </div>
              )}

              {/* 1. Número da GRE em destaque branco puro */}
              <div className="w-full flex items-center justify-center pt-0.5 flex-shrink-0 z-10">
                <span className="text-[10.5px] xs:text-[11.5px] sm:text-xs font-black text-white tracking-tight leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {formatGreNumber(gre.numero)}
                </span>
              </div>

              {/* 2. Nome do Município Sede em Dourado Âmbar Radiante com Quebra Completa */}
              <div className="w-full flex flex-col items-center justify-center my-auto px-0.5 z-10">
                <div className="text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] font-bold text-amber-400 tracking-tight leading-[1.05] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {renderSedeFormatted(sedeText)}
                </div>
              </div>

              {/* 3. Base do Card: Logo Oficial SEDUC | MAPA | GOVERNO DO PIAUÍ */}
              <div className="w-full flex items-center justify-center pb-0.5 flex-shrink-0 z-10">
                <img
                  src="/logo-seduc-piaui.png"
                  alt="SEDUC Piauí"
                  className="h-2.5 xs:h-3 sm:h-3.5 object-contain max-w-[92%] filter drop-shadow opacity-90 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
