import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  Map,
  ClipboardList,
  Navigation,
  AlertOctagon,
  TrendingUp,
  FileSearch,
  MoreVertical
} from 'lucide-react';
import { storage } from '../../services/storageService';

export type ModuleCardId = 'gres' | 'orcamentos' | 'medicoes' | 'rotas' | 'demandas' | 'processos';

const DEFAULT_ORDER: ModuleCardId[] = ['gres', 'orcamentos', 'medicoes', 'rotas', 'demandas', 'processos'];

const LONG_PRESS_MS = 450;
const MOVE_TOLERANCE_PX = 8;

interface ModuleGridProps {
  onOpenGREs: () => void;
  onOpenOS: () => void;
  onOpenMedicoes: () => void;
  onOpenRotas: () => void;
  onOpenDemandas: () => void;
  onOpenProcessos: () => void;
  osAtivasCount: number;
  demandasPendentesCount: number;
}

interface DragState {
  id: ModuleCardId;
  x: number; // posição atual do dedo
  y: number;
  offsetX: number; // ponto do card onde o dedo segurou
  offsetY: number;
  width: number;
  height: number;
}

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  onOpenGREs,
  onOpenOS,
  onOpenMedicoes,
  onOpenRotas,
  onOpenDemandas,
  onOpenProcessos,
  demandasPendentesCount
}) => {
  const [cardOrder, setCardOrder] = useState<ModuleCardId[]>(() => {
    const saved = storage.getHomeCardsOrder() as ModuleCardId[];
    if (Array.isArray(saved) && saved.length === DEFAULT_ORDER.length) {
      const valid = DEFAULT_ORDER.every((id) => saved.includes(id));
      if (valid) return saved;
    }
    return DEFAULT_ORDER;
  });

  const [drag, setDrag] = useState<DragState | null>(null);

  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevRects = useRef<Record<string, DOMRect>>({});
  const orderRef = useRef(cardOrder);
  orderRef.current = cardOrder;
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  // Controle do press longo
  const pressTimer = useRef<any>(null);
  const pressStart = useRef<{ x: number; y: number; id: ModuleCardId } | null>(null);
  const suppressClick = useRef(false);

  const clearPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    pressStart.current = null;
  };

  const handlePointerDown = (id: ModuleCardId, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const slot = slotRefs.current[id];
    if (!slot) return;
    pressStart.current = { x: e.clientX, y: e.clientY, id };

    pressTimer.current = setTimeout(() => {
      const rect = slot.getBoundingClientRect();
      const start = pressStart.current;
      if (!start) return;
      suppressClick.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch {}
      }
      setDrag({
        id,
        x: start.x,
        y: start.y,
        offsetX: start.x - rect.left,
        offsetY: start.y - rect.top,
        width: rect.width,
        height: rect.height
      });
    }, LONG_PRESS_MS);
  };

  const handlePointerMovePending = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pressStart.current;
    if (!start || dragRef.current) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) clearPress(); // virou rolagem
  };

  // Listeners globais enquanto arrasta
  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      setDrag({ ...current, x: e.clientX, y: e.clientY });

      // Descobre o card sob o dedo e abre espaço trocando posições
      const order = orderRef.current;
      for (const id of order) {
        if (id === current.id) continue;
        const el = slotRefs.current[id];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
          const from = order.indexOf(current.id);
          const to = order.indexOf(id);
          if (from !== to) {
            // Guarda posições atuais para animar os demais cards (FLIP)
            Object.keys(slotRefs.current).forEach((k) => {
              const node = slotRefs.current[k];
              if (node) prevRects.current[k] = node.getBoundingClientRect();
            });
            const next = [...order];
            next.splice(from, 1);
            next.splice(to, 0, current.id);
            setCardOrder(next);
          }
          break;
        }
      }
    };

    const onEnd = () => {
      storage.saveHomeCardsOrder(orderRef.current);
      setDrag(null);
      clearPress();
      setTimeout(() => {
        suppressClick.current = false;
      }, 50);
    };

    const blockScroll = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    window.addEventListener('touchmove', blockScroll, { passive: false });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('touchmove', blockScroll);
    };
  }, [drag?.id]);

  // Anima os cards que foram empurrados para abrir espaço
  useLayoutEffect(() => {
    Object.keys(slotRefs.current).forEach((k) => {
      const node = slotRefs.current[k];
      const prev = prevRects.current[k];
      if (!node || !prev) return;
      const now = node.getBoundingClientRect();
      const dx = prev.left - now.left;
      const dy = prev.top - now.top;
      if (dx || dy) {
        node.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
          { duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
        );
      }
    });
    prevRects.current = {};
  }, [cardOrder]);

  const handleCardClick = (action: () => void) => {
    if (suppressClick.current || dragRef.current) return;
    action();
  };

  const getCardDetails = (id: ModuleCardId) => {
    switch (id) {
      case 'gres':
        return {
          title: 'GREs e\nLevantamentos',
          subtitle: '21 GREs • Vistorias',
          icon: Map,
          iconColor: 'text-cyan-300',
          bgClasses: 'from-[#0c1f2d]/90 via-slate-900/80 to-slate-950 border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_8px_25px_rgba(6,182,212,0.12)]',
          glowColor: 'bg-cyan-500/10',
          action: onOpenGREs
        };
      case 'orcamentos':
        return {
          title: 'Orçamentos\ne OS',
          subtitle: 'Ata de Manutenção • OS',
          icon: ClipboardList,
          iconColor: 'text-amber-300',
          bgClasses: 'from-[#2a1f0a]/90 via-slate-900/80 to-slate-950 border-amber-500/30 hover:border-amber-400/50 shadow-[0_8px_25px_rgba(234,179,8,0.12)]',
          glowColor: 'bg-amber-500/10',
          action: onOpenOS
        };
      case 'medicoes':
        return {
          title: 'Medições\nde Obras',
          subtitle: '% Medido • Contratos',
          icon: TrendingUp,
          iconColor: 'text-yellow-300',
          bgClasses: 'from-[#231b07]/90 via-slate-900/80 to-slate-950 border-yellow-500/30 hover:border-yellow-400/50 shadow-[0_8px_25px_rgba(234,179,8,0.12)]',
          glowColor: 'bg-yellow-500/10',
          action: onOpenMedicoes
        };
      case 'rotas':
        return {
          title: 'Rotas de\nVistoria',
          subtitle: 'Sugestões • Viagem',
          icon: Navigation,
          iconColor: 'text-cyan-300',
          bgClasses: 'from-[#0c1f2d]/90 via-slate-900/80 to-slate-950 border-cyan-500/30 hover:border-cyan-400/50 shadow-[0_8px_25px_rgba(6,182,212,0.12)]',
          glowColor: 'bg-cyan-500/10',
          action: onOpenRotas
        };
      case 'demandas':
        return {
          title: 'Central de\nDemandas',
          subtitle: demandasPendentesCount > 0 ? `${demandasPendentesCount} Pendências Ativas` : 'Prazos • Avisos',
          icon: AlertOctagon,
          iconColor: 'text-orange-400',
          bgClasses: 'from-[#2d140c]/90 via-slate-900/80 to-slate-950 border-orange-500/30 hover:border-orange-400/50 shadow-[0_8px_25px_rgba(249,115,22,0.12)]',
          glowColor: 'bg-orange-500/10',
          action: onOpenDemandas
        };
      case 'processos':
        return {
          title: 'Acompanhar\nProcessos SEI',
          subtitle: 'Medições & Diárias',
          icon: FileSearch,
          iconColor: 'text-purple-300',
          bgClasses: 'from-[#1b102b]/90 via-slate-900/80 to-slate-950 border-purple-500/30 hover:border-purple-400/50 shadow-[0_8px_25px_rgba(168,85,247,0.12)]',
          glowColor: 'bg-purple-500/10',
          action: onOpenProcessos
        };
    }
  };

  return (
    <div className="px-4 my-2">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[11px] font-semibold text-slate-400">Módulos de Gestão</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-3.5">
        {cardOrder.map((cardId) => {
          const card = getCardDetails(cardId);
          const Icon = card.icon;
          const isDragging = drag?.id === cardId;

          const cardStyle: React.CSSProperties = isDragging
            ? {
                position: 'fixed',
                left: drag!.x - drag!.offsetX,
                top: drag!.y - drag!.offsetY,
                width: drag!.width,
                height: drag!.height,
                zIndex: 100,
                pointerEvents: 'none',
                transform: 'scale(1.06)',
                touchAction: 'none'
              }
            : {};

          return (
            // Espaço do grid (permanece reservando o lugar do card enquanto ele é arrastado)
            <div
              key={cardId}
              ref={(el) => {
                slotRefs.current[cardId] = el;
              }}
              className="h-40"
            >
              <div
                onPointerDown={(e) => handlePointerDown(cardId, e)}
                onPointerMove={handlePointerMovePending}
                onPointerUp={clearPress}
                onPointerCancel={clearPress}
                onContextMenu={(e) => e.preventDefault()}
                onClick={() => handleCardClick(card.action)}
                style={{ ...cardStyle, WebkitTouchCallout: 'none' } as React.CSSProperties}
                className={`group relative p-3.5 rounded-3xl bg-gradient-to-br ${card.bgClasses} backdrop-blur-2xl flex flex-col justify-between text-left h-40 w-full transition-shadow overflow-hidden select-none ${
                  isDragging
                    ? 'ring-2 ring-amber-400/80 shadow-[0_18px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(245,158,11,0.45)] cursor-grabbing'
                    : 'active-press cursor-pointer'
                }`}
              >
                <div className={`absolute -top-10 -right-10 w-24 h-24 ${card.glowColor} rounded-full blur-xl group-hover:opacity-100 transition-all`} />

                <div className="flex items-start justify-between w-full z-10">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center">
                    <Icon className={`w-5 h-5 stroke-[1.8] ${card.iconColor}`} />
                  </div>
                  <span className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </span>
                </div>

                <div className="z-10">
                  <h3 className="font-extrabold text-sm text-white leading-tight whitespace-pre-line">{card.title}</h3>
                  <p className="text-[10px] text-slate-300 mt-1 font-medium">{card.subtitle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
