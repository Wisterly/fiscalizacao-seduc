import React, { useState } from 'react';
import { Sparkles, Bell, Wifi, WifiOff, X, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { AlertaUrgente } from '../../types';

interface HeaderProps {
  alertas: AlertaUrgente[];
  onResolverAlerta: (id: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  alertas,
  onResolverAlerta,
  onNavigateToTab
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline] = useState(navigator.onLine);

  const alertasPendentes = alertas.filter(a => !a.resolvido);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#090D16]/90 backdrop-blur-2xl border-b border-white/[0.08] px-3.5 pt-2.5 pb-2.5">
        <div className="flex items-center justify-between max-w-md mx-auto gap-2">
          {/* Canto Superior Esquerdo: Ícone/Logo 3D + Nome do Projeto */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <img
                src="/app-icon.png"
                alt="Fiscaliz.IA.lab - GPR"
                className="w-10 h-10 rounded-2xl object-cover shadow-glass-glow-gold border border-amber-500/40 p-0.5 bg-slate-900"
              />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-950 shadow-glass-glow-turq" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs font-black text-white tracking-tight leading-none truncate">
                  Fiscaliz.IA.lab - GPR
                </h1>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[9px] text-cyan-300 font-bold animate-ai-glow">
                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                  IA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1 truncate">
                <span>Fiscalização de Obras</span>
                <span className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="flex items-center gap-1 text-[9px] text-emerald-400">
                  {isOnline ? (
                    <>
                      <Wifi className="w-2.5 h-2.5" />
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-2.5 h-2.5 text-amber-400" />
                      <span>Offline</span>
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Canto Superior Direito: Logo Secretaria de Educação com mapa do Piauí + Sino */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="h-9 px-1.5 py-1 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <img
                src="/logo-piaui-mapa.png"
                alt="Secretaria de Educação - Governo do Piauí"
                onError={(e) => {
                  // Fallback se não carregar dark-theme
                  (e.target as HTMLImageElement).src = '/logo-seduc-piaui.png';
                }}
                className="h-7 w-auto object-contain max-w-[85px]"
                title="Secretaria de Estado da Educação - SEDUC Piauí"
              />
            </div>

            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 rounded-xl bg-slate-800/80 border border-white/10 active-press text-slate-300 hover:text-white"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              {alertasPendentes.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center shadow-glass-glow-orange border border-slate-900">
                  {alertasPendentes.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modal de Notificações e Alertas */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md mt-12 bg-[#0D1424] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-white text-sm">Central de Alertas & Notificações</h3>
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2.5 flex-1 no-scrollbar">
              {alertasPendentes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/70 mb-2" />
                  <p className="text-sm font-medium text-slate-300">Tudo limpo por aqui!</p>
                  <p className="text-xs text-slate-500">Nenhum alerta pendente no momento.</p>
                </div>
              ) : (
                alertasPendentes.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-white/10 flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-500" />
                    
                    <div className="flex items-start justify-between gap-2 pl-2">
                      <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{alerta.titulo}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{alerta.dataCriacao}</span>
                    </div>

                    <p className="text-xs text-slate-300 pl-2 leading-relaxed">
                      {alerta.descricao}
                    </p>

                    <div className="flex items-center justify-between pt-1 pl-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                        Resp: <strong className="text-orange-300">{alerta.responsavel}</strong>
                      </span>

                      <div className="flex items-center gap-2">
                        {onNavigateToTab && (
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              onNavigateToTab(alerta.linkModulo);
                            }}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 active-press"
                          >
                            Ir p/ Módulo
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onResolverAlerta(alerta.id)}
                          className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 active-press"
                        >
                          Dar OK
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/10 bg-slate-900/40 text-center">
              <button
                onClick={() => setShowNotifications(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
