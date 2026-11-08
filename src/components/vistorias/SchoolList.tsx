import React, { useState } from 'react';
import { Search, MapPin, Calendar, Clock, ArrowLeft, Plus, FileText, ChevronRight, AlertTriangle } from 'lucide-react';
import { Escola, GRE } from '../../types';
import { StatusConservacaoBadge } from '../common/Badge';

interface SchoolListProps {
  gre: GRE;
  schools: Escola[];
  onBack: () => void;
  onSelectSchool: (school: Escola) => void;
  onOpenNovoLevantamentoDireto?: (school: Escola) => void;
}

export const SchoolList: React.FC<SchoolListProps> = ({
  gre,
  schools,
  onBack,
  onSelectSchool,
  onOpenNovoLevantamentoDireto
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  const greSchools = schools.filter(s => s.greId === gre.id);

  const filteredSchools = greSchools.filter(school => {
    const matchesSearch =
      school.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.endereco.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filtroStatus === 'todos' || school.statusConservacao === filtroStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full">
      {/* Cabeçalho da GRE selecionada */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white active-press"
          aria-label="Voltar para lista de GREs"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
            {gre.nome}
          </h2>
          <p className="text-[11px] text-slate-400">
            Sede em {gre.sede} • {greSchools.length} escolas cadastradas
          </p>
        </div>
      </div>

      {/* Busca e Filtros Rápidos */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar escola por nome ou município..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 backdrop-blur-xl transition-all"
          />
        </div>

        {/* Abas de filtro rápido por status */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {['todos', 'critico', 'atencao', 'regular', 'bom'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold capitalize whitespace-nowrap active-press transition-all ${
                filtroStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glass-glow-turq'
                  : 'bg-slate-900/40 text-slate-400 border border-white/5 hover:text-slate-200'
              }`}
            >
              {st === 'todos' ? 'Todas' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Escolas */}
      <div className="space-y-2.5 max-h-[66vh] overflow-y-auto no-scrollbar pr-0.5">
        {filteredSchools.map((school) => {
          const isMuitoTempo = school.diasSemVisita > 60;

          return (
            <div
              key={school.id}
              onClick={() => onSelectSchool(school)}
              className="p-3.5 rounded-2xl bg-slate-900/50 hover:bg-slate-900/70 border border-white/10 hover:border-cyan-500/30 backdrop-blur-xl transition-all duration-200 cursor-pointer active-press"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-xs text-white leading-snug line-clamp-1">
                    {school.nome}
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                    <span>{school.municipio} • {school.endereco}</span>
                  </p>
                </div>
                <StatusConservacaoBadge status={school.statusConservacao} />
              </div>

              {/* Informações adicionais da escola */}
              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/[0.06] text-slate-400 flex-wrap gap-1">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 ${isMuitoTempo ? 'text-orange-400 font-semibold' : 'text-slate-400'}`}>
                    <Clock className="w-3 h-3" />
                    {school.diasSemVisita === 0 ? 'Visitada recentemente' : `${school.diasSemVisita} dias sem visita`}
                  </span>

                  {school.temOsAtiva && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      <FileText className="w-2.5 h-2.5" />
                      OS Ativa
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {onOpenNovoLevantamentoDireto && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNovoLevantamentoDireto(school);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 active-press"
                    >
                      <Plus className="w-3 h-3" />
                      Vistoriar
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchools.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhuma escola encontrada nesta GRE com os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
};
