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

  // Mapa oficial de sedes conforme planilha DADOS INEP SEDUC-PI
  const GRE_SEDES_OFICIAIS: Record<number, string> = {
    4: 'Teresina Centro/Norte',
    9: 'Picos',
    10: 'Floriano',
    11: 'Uruçuí',
    12: 'São João do Piauí',
    13: 'São Raimundo Nonato',
    18: 'Grande Teresina',
    19: 'Teresina Sul',
    20: 'Teresina Leste',
    21: 'Teresina Sudeste'
  };

  // Quebras de linha pré-definidas para leitura integral em cards redondos
  const SEDE_LINE_BREAKS: Record<string, [string, string]> = {
    'São João do Piauí': ['São João', 'do Piauí'],
    'São Raimundo Nonato': ['São Raimundo', 'Nonato'],
    'Valença do Piauí': ['Valença', 'do Piauí'],
    'Teresina Centro/Norte': ['Teresina', 'Centro/Norte'],
    'Grande Teresina': ['Grande', 'Teresina'],
    'Teresina Sudeste': ['Teresina', 'Sudeste'],
    'Teresina Leste': ['Teresina', 'Leste'],
    'Teresina Norte': ['Teresina', 'Norte'],
    'Teresina Sul': ['Teresina', 'Sul'],
    'Campo Maior': ['Campo', 'Maior'],
    'Bom Jesus': ['Bom', 'Jesus']
  };

  const getSedeName = (gre: GRE) => GRE_SEDES_OFICIAIS[gre.numero] || gre.sede;

  const renderSedeFormatted = (sede: string) => {
    const lines = SEDE_LINE_BREAKS[sede];
    if (lines) {
      return (
        <span className="block leading-[1.05]">
          {lines[0]}<br />{lines[1]}
        </span>
      );
    }
    return <span className="block leading-[1.05]">{sede}</span>;
  };

  return (
    <div className="w-full flex flex-col justify-start select-none pb-4">
      {/* Título Superior: 1. Selecionar a GRE */}
      <div className="flex items-center gap-2 mb-3 px-1">
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

      {/* Grid 4 Colunas com Cards Redondos e Borda Furtacor */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {sortedGres.map((gre) => {
          const isSelected = selectedGreId === gre.id;
          const sedeText = getSedeName(gre);

          return (
            <button
              key={gre.id}
              type="button"
              onClick={() => onSelectGre(gre)}
              aria-label={`${formatGreNumber(gre.numero)} - ${sedeText}`}
              className={`group relative aspect-square w-full rounded-full transition-all duration-200 active:scale-95 cursor-pointer flex items-center justify-center p-[2px] ${
                isSelected
                  ? 'border-furtacor-active shadow-[0_0_24px_rgba(251,191,36,0.7),0_0_14px_rgba(6,182,212,0.5)] scale-[1.03]'
                  : 'border-furtacor shadow-[0_0_12px_rgba(245,158,11,0.2),0_0_8px_rgba(6,182,212,0.15)] hover:scale-105'
              }`}
            >
              {/* Selo de Seleção Ativa no Canto Superior Direito da Circunferência */}
              {isSelected && (
                <div className="absolute -top-0.5 -right-0.5 z-30 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg ring-2 ring-slate-950">
                  <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                </div>
              )}

              {/* Miolo Circular Interno com Fundo Cósmico Profundo */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0D162E] via-[#081022] to-[#040816] flex flex-col justify-between items-center px-1 py-1.5 xs:py-2 text-center overflow-hidden relative shadow-[inset_0_0_12px_rgba(0,0,0,0.85)]">
                
                {/* Reflexo vítreo superior sutil */}
                <div className="absolute top-0 inset-x-3 h-[40%] bg-gradient-to-b from-white/[0.08] to-transparent rounded-t-full pointer-events-none" />

                {/* 1. Número da GRE Maior em destaque branco puro */}
                <div className="w-full flex items-center justify-center pt-0.5 flex-shrink-0 z-10">
                  <span className="text-[12.5px] xs:text-[14px] sm:text-[15.5px] font-black text-white tracking-tight leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                    {formatGreNumber(gre.numero)}
                  </span>
                </div>

                {/* 2. Nome do Município Sede em Dourado Âmbar Radiante com Quebra Completa */}
                <div className="w-full flex flex-col items-center justify-center my-auto px-0.5 z-10">
                  <div className="text-[8px] xs:text-[9px] sm:text-[10.5px] font-extrabold text-amber-400 tracking-tight leading-[1.06] drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                    {renderSedeFormatted(sedeText)}
                  </div>
                </div>

                {/* 3. Base do Círculo: Logo Oficial SEDUC | MAPA | GOVERNO DO PIAUÍ */}
                <div className="w-full flex items-center justify-center pb-0.5 flex-shrink-0 z-10">
                  <img
                    src="/logo-seduc-piaui.png"
                    alt="SEDUC Piauí"
                    className="h-2.5 xs:h-3 sm:h-3.5 object-contain max-w-[76%] filter drop-shadow opacity-95 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
