import React from 'react';
import { Camera, FileText, Compass, AlertOctagon, ArrowUpRight, Sparkles } from 'lucide-react';

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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Módulos Operacionais SEDUC
        </h2>
        <span className="text-[11px] text-slate-500 font-medium">Toque para acessar</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: GREs e Levantamentos (Azul Turquesa) */}
        <button
          onClick={onOpenGREs}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 border border-cyan-500/25 hover:border-cyan-400/40 backdrop-blur-xl shadow-glass flex flex-col justify-between text-left h-36 active-press transition-all duration-200 overflow-hidden"
        >
          {/* Brilho translúcido sutil */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/15 rounded-full blur-xl group-hover:bg-cyan-500/25 transition-all" />

          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glass-glow-turq">
              <Camera className="w-5 h-5" />
            </div>
            <span className="p-1 rounded-full bg-white/5 text-slate-400 group-hover:text-cyan-300 transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              21 GREs & Escolas
            </span>
            <h3 className="font-bold text-sm text-white leading-tight mt-0.5">
              Levantamentos
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Iniciar ou consultar vistorias
            </p>
          </div>
        </button>

        {/* Card 2: Orçamentos, OS e Medições (Dourado) */}
        <button
          onClick={onOpenOS}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/60 to-slate-950/80 border border-amber-500/25 hover:border-amber-400/40 backdrop-blur-xl shadow-glass flex flex-col justify-between text-left h-36 active-press transition-all duration-200 overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/15 rounded-full blur-xl group-hover:bg-amber-500/25 transition-all" />

          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glass-glow-gold">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {osAtivasCount} OS Ativas
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Controle de Obras
            </span>
            <h3 className="font-bold text-sm text-white leading-tight mt-0.5">
              Orçamentos & Medições
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Histórico • % de Medição
            </p>
          </div>
        </button>

        {/* Card 3: Rotas de Vistoria IA (Verde/Turquesa) */}
        <button
          onClick={onOpenRotas}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900/60 to-slate-950/80 border border-teal-500/25 hover:border-teal-400/40 backdrop-blur-xl shadow-glass flex flex-col justify-between text-left h-36 active-press transition-all duration-200 overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500/15 rounded-full blur-xl group-hover:bg-teal-500/25 transition-all" />

          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glass-glow-turq">
              <Compass className="w-5 h-5" />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-ai-glow">
              <Sparkles className="w-2.5 h-2.5 text-teal-300" />
              IA
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Planejador Inteligente
            </span>
            <h3 className="font-bold text-sm text-white leading-tight mt-0.5">
              Rotas de Vistoria IA
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Sugestão • WhatsApp 1-Click
            </p>
          </div>
        </button>

        {/* Card 4: Central de Demandas (Laranja) */}
        <button
          onClick={onOpenDemandas}
          className="group relative p-4 rounded-2xl bg-gradient-to-br from-orange-950/40 via-slate-900/60 to-slate-950/80 border border-orange-500/25 hover:border-orange-400/40 backdrop-blur-xl shadow-glass flex flex-col justify-between text-left h-36 active-press transition-all duration-200 overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/15 rounded-full blur-xl group-hover:bg-orange-500/25 transition-all" />

          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-glass-glow-orange">
              <AlertOctagon className="w-5 h-5" />
            </div>
            {demandasPendentesCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                {demandasPendentesCount} Pendências
              </span>
            )}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
              Prazos & Avisos
            </span>
            <h3 className="font-bold text-sm text-white leading-tight mt-0.5">
              Central de Demandas
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
              Avisos programados • Naila
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
