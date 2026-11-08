import React from 'react';
import { Map, ClipboardList, Navigation, AlertOctagon, MoreVertical } from 'lucide-react';

interface ModuleGridProps {
  onOpenGREs: () => void;
  onOpenOS: () => void;
  onOpenRotas: () => void;
  onOpenDemandas: () => void;
  osAtivasCount: number;
  demandasPendentesCount: number;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  onOpenGREs,
  onOpenOS,
  onOpenRotas,
  onOpenDemandas,
  osAtivasCount,
  demandasPendentesCount
}) => {
  return (
    <div className="px-4 my-2">
      <div className="grid grid-cols-2 gap-3">
        {/* CARD 1: GREs e Levantamentos (Ciano/Turquesa) */}
        <button
          onClick={onOpenGREs}
          className="group relative p-4 rounded-3xl bg-gradient-to-br from-[#0c1f2d]/80 via-slate-900/70 to-slate-950/90 border border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-2xl shadow-[0_8px_25px_rgba(6,182,212,0.12)] flex flex-col justify-between text-left h-40 active-press transition-all overflow-hidden"
        >
          {/* Brilho translúcido */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />

          {/* Topo: Ícone em traço fino ciano + Menu ⋮ */}
          <div className="flex items-start justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
              <Map className="w-6 h-6 stroke-[1.6]" />
            </div>
            <span className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </span>
          </div>

          {/* Textos */}
          <div>
            <h3 className="font-extrabold text-sm text-white leading-tight">
              GREs e<br />Levantamentos
            </h3>
            <p className="text-[10px] text-cyan-400/90 mt-1 font-medium">
              21 GREs • Vistorias
            </p>
          </div>
        </button>

        {/* CARD 2: Orçamentos, OS e Medições (Dourado/Âmbar) */}
        <button
          onClick={onOpenOS}
          className="group relative p-4 rounded-3xl bg-gradient-to-br from-[#2a1f0a]/80 via-slate-900/70 to-slate-950/90 border border-amber-500/30 hover:border-amber-400/50 backdrop-blur-2xl shadow-[0_8px_25px_rgba(234,179,8,0.12)] flex flex-col justify-between text-left h-40 active-press transition-all overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-start justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-300">
              <ClipboardList className="w-6 h-6 stroke-[1.6]" />
            </div>
            <span className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-white leading-tight">
              Orçamentos,<br />OS e Medições
            </h3>
            <p className="text-[10px] text-amber-400/90 mt-1 font-medium">
              OS Ativas • % Medição
            </p>
          </div>
        </button>

        {/* CARD 3: Rotas de Vistoria (Ciano/Turquesa) */}
        <button
          onClick={onOpenRotas}
          className="group relative p-4 rounded-3xl bg-gradient-to-br from-[#0c1f2d]/80 via-slate-900/70 to-slate-950/90 border border-cyan-500/30 hover:border-cyan-400/50 backdrop-blur-2xl shadow-[0_8px_25px_rgba(6,182,212,0.12)] flex flex-col justify-between text-left h-40 active-press transition-all overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all" />

          <div className="flex items-start justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-300">
              <Navigation className="w-6 h-6 stroke-[1.6]" />
            </div>
            <span className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-white leading-tight">
              Rotas de<br />Vistoria
            </h3>
            <p className="text-[10px] text-cyan-400/90 mt-1 font-medium">
              Sugestões • Copiar WhatsApp
            </p>
          </div>
        </button>

        {/* CARD 4: Central de Demandas (Laranja Quente) */}
        <button
          onClick={onOpenDemandas}
          className="group relative p-4 rounded-3xl bg-gradient-to-br from-[#2d140c]/80 via-slate-900/70 to-slate-950/90 border border-orange-500/30 hover:border-orange-400/50 backdrop-blur-2xl shadow-[0_8px_25px_rgba(249,115,22,0.12)] flex flex-col justify-between text-left h-40 active-press transition-all overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all" />

          <div className="flex items-start justify-between w-full">
            <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
              <AlertOctagon className="w-6 h-6 stroke-[1.6]" />
            </div>
            <span className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-sm text-white leading-tight">
              Central de<br />Demandas
            </h3>
            <p className="text-[10px] text-orange-400/90 mt-1 font-medium">
              {demandasPendentesCount > 0 ? `${demandasPendentesCount} Pendências Ativas` : 'Prazos • Avisos Naila'}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
