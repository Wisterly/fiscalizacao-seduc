import React, { useState } from 'react';
import { Star, Search, MapPin, ChevronRight, School, Sparkles } from 'lucide-react';
import { GRE, Escola } from '../../types';

interface GreSelectorProps {
  gres: GRE[];
  schools: Escola[];
  selectedGreId: string | null;
  onSelectGre: (gre: GRE) => void;
  onToggleFavorite: (greId: string) => void;
}

export const GreSelector: React.FC<GreSelectorProps> = ({
  gres,
  schools,
  selectedGreId,
  onSelectGre,
  onToggleFavorite
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Ordena favoritas no topo e depois por número da GRE
  const sortedGres = [...gres].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return a.numero - b.numero;
  });

  const filteredGres = sortedGres.filter(g =>
    g.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.sede.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.municipios.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full">
      {/* Barra de Busca rápida de GREs */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar GRE por número, sede ou município..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 backdrop-blur-xl transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Grid / Lista das 21 GREs */}
      <div className="space-y-2 max-h-[70vh] overflow-y-auto no-scrollbar pr-0.5">
        {filteredGres.map((gre) => {
          const isSelected = selectedGreId === gre.id;
          const greSchools = schools.filter(s => s.greId === gre.id);
          const criticasCount = greSchools.filter(s => s.statusConservacao === 'critico').length;

          return (
            <div
              key={gre.id}
              onClick={() => onSelectGre(gre)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer active-press flex items-center justify-between gap-3 backdrop-blur-xl ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-400/50 shadow-glass-glow-turq'
                  : 'bg-slate-900/50 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Botão de Favorito / Fixar */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(gre.id);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    gre.isFavorite
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-slate-400 hover:text-slate-200 bg-white/5'
                  }`}
                  title={gre.isFavorite ? 'Fixada no topo' : 'Fixar no topo'}
                >
                  <Star className={`w-4 h-4 ${gre.isFavorite ? 'fill-amber-400' : ''}`} />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white tracking-tight truncate">
                      {gre.nome}
                    </span>
                    {gre.isFavorite && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                        Fixada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      Sede: <strong className="text-slate-300 font-medium">{gre.sede}</strong>
                    </span>

                    <span className="flex items-center gap-1">
                      <School className="w-3 h-3 text-slate-400" />
                      {greSchools.length} {greSchools.length === 1 ? 'escola' : 'escolas'}
                    </span>

                    {criticasCount > 0 && (
                      <span className="text-[10px] text-orange-400 font-semibold bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">
                        {criticasCount} crítica
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
              </div>
            </div>
          );
        })}

        {filteredGres.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhuma GRE encontrada com o termo "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};
