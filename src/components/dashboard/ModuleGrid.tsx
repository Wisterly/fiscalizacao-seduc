import React, { useState, useRef, useEffect } from 'react';
import {
  Map,
  ClipboardList,
  Navigation,
  AlertOctagon,
  TrendingUp,
  FileSearch,
  MoreVertical,
  Check,
  RotateCcw,
  Move,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { storage } from '../../services/storageService';

export type ModuleCardId = 'gres' | 'orcamentos' | 'medicoes' | 'rotas' | 'demandas' | 'processos';

const DEFAULT_ORDER: ModuleCardId[] = ['gres', 'orcamentos', 'medicoes', 'rotas', 'demandas', 'processos'];

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

export const ModuleGrid: React.FC<ModuleGridProps> = ({
  onOpenGREs,
  onOpenOS,
  onOpenMedicoes,
  onOpenRotas,
  onOpenDemandas,
  onOpenProcessos,
  osAtivasCount,
  demandasPendentesCount
}) => {
  // Ordem atual dos cards carregada do storage
  const [cardOrder, setCardOrder] = useState<ModuleCardId[]>(() => {
    const saved = storage.getHomeCardsOrder() as ModuleCardId[];
    if (Array.isArray(saved) && saved.length === DEFAULT_ORDER.length) {
      const valid = DEFAULT_ORDER.every((id) => saved.includes(id));
      if (valid) return saved;
    }
    return DEFAULT_ORDER;
  });

  // Modo de reorganização ativo (efeito de tremor e cards soltos)
  const [isReordering, setIsReordering] = useState(false);
  const [draggedCardId, setDraggedCardId] = useState<ModuleCardId | null>(null);

  // Timer para Long Press (Pressionar e segurar por 450ms)
  const pressTimerRef = useRef<any>(null);
  const isLongPressTriggeredRef = useRef(false);

  const startPressTimer = () => {
    isLongPressTriggeredRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsReordering(true);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([40, 30, 40]);
        } catch {}
      }
    }, 450);
  };

  const cancelPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleCardClick = (cardId: ModuleCardId, defaultAction: () => void) => {
    // Se estava em long press ou está no modo de reorganização, não abre a tela
    if (isLongPressTriggeredRef.current || isReordering) {
      return;
    }
    defaultAction();
  };

  const handleMoveCard = (index: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cardOrder.length) return;

    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, removed);
    setCardOrder(newOrder);
    storage.saveHomeCardsOrder(newOrder);
  };

  // Drag and Drop HTML5
  const handleDragStart = (cardId: ModuleCardId) => {
    setDraggedCardId(cardId);
  };

  const handleDrop = (targetCardId: ModuleCardId) => {
    if (!draggedCardId || draggedCardId === targetCardId) return;

    const fromIndex = cardOrder.indexOf(draggedCardId);
    const toIndex = cardOrder.indexOf(targetCardId);

    const newOrder = [...cardOrder];
    const [removed] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, removed);

    setCardOrder(newOrder);
    storage.saveHomeCardsOrder(newOrder);
    setDraggedCardId(null);
  };

  const handleResetOrder = () => {
    setCardOrder(DEFAULT_ORDER);
    storage.saveHomeCardsOrder(DEFAULT_ORDER);
  };

  // Definições visuais e de ação de cada card
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
      {/* BARRA SUPERIOR DE FEEDBACK QUANDO O MODO DE REORGANIZAÇÃO ESTÁ ATIVO */}
      {isReordering ? (
        <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.3)] flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <div>
              <span className="text-xs font-black text-amber-300 block leading-tight">
                Modo de Organização Ativo
              </span>
              <span className="text-[10px] text-slate-300">
                Arraste os cards ou use as setas para mover
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetOrder}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-white/10 active-press"
              title="Restaurar Ordem Padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsReordering(false)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs shadow-glass-glow-turq active-press flex items-center gap-1"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Concluir</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-semibold text-slate-400">
            Módulos de Gestão
          </span>
          <button
            onClick={() => setIsReordering(true)}
            className="text-[10px] text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1 py-0.5 px-1.5 rounded-lg hover:bg-white/5 active-press"
            title="Segure qualquer card ou clique aqui para reorganizar a posição"
          >
            <Move className="w-3 h-3 text-amber-400" />
            <span>Mover cards</span>
          </button>
        </div>
      )}

      {/* GRID INTERATIVO DOS 6 CARDS COM ANIMAÇÃO DE 'SOLTO' (JIGGLE / WIGGLE) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-3.5">
        {cardOrder.map((cardId, index) => {
          const card = getCardDetails(cardId);
          const Icon = card.icon;

          return (
            <div
              key={cardId}
              draggable={isReordering}
              onDragStart={() => handleDragStart(cardId)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(cardId)}
              onTouchStart={startPressTimer}
              onTouchEnd={cancelPressTimer}
              onTouchMove={cancelPressTimer}
              onMouseDown={startPressTimer}
              onMouseUp={cancelPressTimer}
              onMouseLeave={cancelPressTimer}
              onClick={() => handleCardClick(cardId, card.action)}
              className={`group relative p-3.5 rounded-3xl bg-gradient-to-br ${card.bgClasses} backdrop-blur-2xl flex flex-col justify-between text-left h-40 transition-all overflow-hidden select-none ${
                isReordering
                  ? 'animate-wiggle scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/80 cursor-grab active:cursor-grabbing'
                  : 'active-press cursor-pointer'
              }`}
            >
              {/* Brilho translúcido */}
              <div className={`absolute -top-10 -right-10 w-24 h-24 ${card.glowColor} rounded-full blur-xl group-hover:opacity-100 transition-all`} />

              {/* Topo do Card */}
              <div className="flex items-start justify-between w-full z-10">
                <div className="w-10 h-10 rounded-2xl bg-white/[0.08] border border-white/15 flex items-center justify-center">
                  <Icon className={`w-5 h-5 stroke-[1.8] ${card.iconColor}`} />
                </div>

                {/* Controles no Modo Reorganização: Setas de Mover */}
                {isReordering ? (
                  <div className="flex items-center gap-1 bg-black/70 p-0.5 rounded-xl border border-amber-400/50 shadow-md">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => handleMoveCard(index, 'left', e)}
                      className="p-1 rounded-lg text-amber-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none active-press"
                      title="Mover para trás"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      disabled={index === cardOrder.length - 1}
                      onClick={(e) => handleMoveCard(index, 'right', e)}
                      className="p-1 rounded-lg text-amber-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none active-press"
                      title="Mover para frente"
                    >
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                ) : (
                  <span className="p-1 text-slate-500 group-hover:text-slate-300 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </span>
                )}
              </div>

              {/* Textos */}
              <div className="z-10">
                <h3 className="font-extrabold text-sm text-white leading-tight whitespace-pre-line">
                  {card.title}
                </h3>
                <p className="text-[10px] text-slate-300 mt-1 font-medium">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
