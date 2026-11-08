import React, { useState } from 'react';
import { AlertTriangle, MoreVertical, Check, ArrowRight } from 'lucide-react';
import { AlertaUrgente } from '../../types';

interface UrgentAlertsCarouselProps {
  alertas: AlertaUrgente[];
  onDarOk: (id: string) => void;
  onAbrir: (alerta: AlertaUrgente) => void;
  onVerTodas?: () => void;
}

export const UrgentAlertsCarousel: React.FC<UrgentAlertsCarouselProps> = ({
  alertas,
  onDarOk,
  onAbrir,
  onVerTodas
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const pendentes = alertas.filter(a => !a.resolvido);

  if (pendentes.length === 0) {
    return (
      <div className="mx-4 my-2 p-4 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Sem pendências críticas hoje. Todas as GREs vistoriadas!</span>
        </div>
      </div>
    );
  }

  const currentAlerta = pendentes[currentIndex % pendentes.length];

  return (
    <div className="w-full px-4 my-2.5">
      {/* Card Retangular Iluminado Idêntico à Imagem de Referência */}
      <div className="relative rounded-3xl p-4 bg-gradient-to-br from-orange-600/35 via-amber-700/20 to-slate-900/70 border border-orange-500/40 backdrop-blur-2xl shadow-[0_8px_32px_rgba(249,115,22,0.20)] overflow-hidden transition-all">
        {/* Brilho translúcido sutil */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Topo do Card: ⚠️ Alertas Urgentes + Menu ⋮ */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <AlertTriangle className="w-4 h-4 fill-orange-400 text-slate-950" />
            </div>
            <h3 className="font-extrabold text-sm text-orange-300 tracking-tight">
              Alertas Urgentes
            </h3>
          </div>

          <button
            onClick={() => onDarOk(currentAlerta.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-white active-press"
            title="Concluir alerta"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Texto do Alerta */}
        <p className="text-xs text-slate-100 font-medium leading-relaxed pl-1 mb-3">
          {currentAlerta.descricao || 'Atenção: 3 escolas com pendências críticas não enviadas na GRE 01'}
        </p>

        {/* Rodapé do Card: Ações & "Ver Todas" */}
        <div className="flex items-center justify-between pt-1 pl-1">
          <button
            onClick={() => onDarOk(currentAlerta.id)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-emerald-200 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 active-press transition-colors"
          >
            <Check className="w-3 h-3 stroke-[2.5]" />
            Dar OK
          </button>

          <button
            onClick={() => {
              if (onVerTodas) onVerTodas();
              else onAbrir(currentAlerta);
            }}
            className="text-xs font-bold text-orange-300 hover:text-orange-200 underline active-press"
          >
            Ver Todas
          </button>
        </div>
      </div>

      {/* Indicadores de Paginação (Dots do Carousel) */}
      <div className="flex items-center justify-center gap-1.5 mt-2.5">
        {pendentes.slice(0, 5).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === idx
                ? 'w-5 h-1.5 bg-orange-400 shadow-glass-glow-orange'
                : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
