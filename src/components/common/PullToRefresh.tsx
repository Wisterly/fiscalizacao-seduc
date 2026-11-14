import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw, Check, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

type RefreshState = 'idle' | 'pulling' | 'refreshing' | 'success';

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [refreshState, setRefreshState] = useState<RefreshState>('idle');
  const [pullDistance, setPullDistance] = useState<number>(0);

  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const THRESHOLD = 65; // Distância mínima em px para acionar a atualização
  const MAX_PULL = 95;  // Limite máximo de estiramento elástico

  // Verifica se o scroll está rigorosamente no topo
  const isAtTop = useCallback(() => {
    if (!containerRef.current) return window.scrollY === 0;
    return containerRef.current.scrollTop === 0 && window.scrollY === 0;
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (refreshState === 'refreshing' || refreshState === 'success') return;
    if (isAtTop()) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    if (refreshState === 'refreshing' || refreshState === 'success') return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && isAtTop()) {
      // Efeito de resistência elástica amortecida
      const damped = Math.min(MAX_PULL, diff * 0.45);
      setPullDistance(damped);
      setRefreshState('pulling');
    } else {
      setPullDistance(0);
      setRefreshState('idle');
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistance >= THRESHOLD && refreshState === 'pulling') {
      // Aciona o refresh
      setPullDistance(0);
      setRefreshState('refreshing');

      try {
        await onRefresh();
      } catch (err) {
        console.warn('Erro durante pull-to-refresh:', err);
      }

      // Vira a marca de CHECK verde
      setRefreshState('success');

      // Em até 1.8s a 2s no máximo, some da tela
      setTimeout(() => {
        setRefreshState('idle');
      }, 1800);
    } else {
      setPullDistance(0);
      setRefreshState('idle');
    }
  };

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-screen"
    >
      {/* INDICADOR FLUTUANTE DE PULL / SPINNER / CHECK */}
      {(refreshState !== 'idle' || pullDistance > 0) && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 flex items-center justify-center"
          style={{
            transform: `translate(-50%, ${refreshState === 'pulling' ? Math.min(pullDistance * 0.8, 50) : 10}px)`
          }}
        >
          <div className="bg-slate-900/95 border border-white/10 rounded-full px-4 py-2 shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-white animate-fadeIn">
            {refreshState === 'pulling' && (
              <>
                <div 
                  className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent flex items-center justify-center transition-transform"
                  style={{ transform: `rotate(${pullDistance * 4}deg)` }}
                >
                  <ArrowDown className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  {pullDistance >= THRESHOLD ? 'Solte para atualizar' : 'Puxe para atualizar'}
                </span>
              </>
            )}

            {refreshState === 'refreshing' && (
              <>
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-amber-300">
                  Verificando atualizações...
                </span>
              </>
            )}

            {refreshState === 'success' && (
              <>
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-scaleUp">
                  {/* Ícone de Check estilo Nike / Esmeralda */}
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <span className="text-xs font-black text-emerald-400">
                  Atualizado!
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO COM ANIMAÇÃO DE DESLOCAMENTO ELÁSTICO */}
      <div 
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : 'none',
          transition: isDraggingRef.current ? 'none' : 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
};
