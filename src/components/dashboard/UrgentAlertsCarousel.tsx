import React, { useRef } from 'react';
import { AlertCircle, Check, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { AlertaUrgente } from '../../types';

interface UrgentAlertsCarouselProps {
  alertas: AlertaUrgente[];
  onDarOk: (id: string) => void;
  onAbrir: (alerta: AlertaUrgente) => void;
}

export const UrgentAlertsCarousel: React.FC<UrgentAlertsCarouselProps> = ({
  alertas,
  onDarOk,
  onAbrir
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendentes = alertas.filter(a => !a.resolvido);

  if (pendentes.length === 0) {
    return (
      <div className="mx-4 my-2 p-3.5 rounded-2xl bg-slate-800/30 border border-white/5 backdrop-blur-md flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Sem pendências críticas para hoje. Excelente trabalho!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-3">
      {/* Header do carrossel */}
      <div className="flex items-center justify-between px-4 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-orange-400">
            Alertas Urgentes Prioritários
          </h2>
          <span className="text-[10px] text-slate-400 font-medium">({pendentes.length})</span>
        </div>
        <span className="text-[11px] text-slate-400">Deslize para o lado ➔</span>
      </div>

      {/* Container horizontal com rolagem suave / swipe */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {pendentes.map((alerta) => {
          const isNaila = alerta.responsavel === 'Naila' || alerta.titulo.includes('Naila');
          const isCritico = alerta.prioridade === 'critica';

          return (
            <div
              key={alerta.id}
              className={`snap-center flex-shrink-0 w-[84vw] max-w-[340px] rounded-2xl p-4 transition-all duration-200 relative overflow-hidden backdrop-blur-xl border ${
                isCritico
                  ? 'bg-gradient-to-br from-orange-950/40 via-slate-900/60 to-slate-950/70 border-orange-500/30 shadow-glass-glow-orange'
                  : 'bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-950/70 border-amber-500/30 shadow-glass-glow-gold'
              }`}
            >
              {/* Brilho superior de vidro */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Tag de Alerta e Responsável */}
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isCritico
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  <AlertCircle className="w-3 h-3" />
                  {isCritico ? 'Crítico Imediato' : 'Prioridade Alta'}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-medium bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                  <UserCheck className="w-3 h-3 text-cyan-400" />
                  {alerta.responsavel}
                </span>
              </div>

              {/* Título e Descrição */}
              <h3 className="font-bold text-sm text-white line-clamp-1 mb-1 tracking-tight">
                {alerta.titulo}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                {alerta.descricao}
              </p>

              {/* Rodapé do Card com Ações Rápidas */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
                <button
                  onClick={() => onDarOk(alerta.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold active-press transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Dar OK
                </button>

                <button
                  onClick={() => onAbrir(alerta)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 active-press transition-colors"
                >
                  Abrir
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
