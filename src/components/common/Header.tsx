import React, { useState } from 'react';
import { Menu, Sparkles, Bell, Wifi, WifiOff, X, CheckCircle2, ChevronRight, AlertTriangle, ArrowLeft, MoreVertical } from 'lucide-react';
import { AlertaUrgente } from '../../types';

interface HeaderProps {
  alertas: AlertaUrgente[];
  onResolverAlerta: (id: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenMenu?: () => void;
  subViewTitle?: string | null;
  onBackFromSubView?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  alertas,
  onResolverAlerta,
  onNavigateToTab,
  onOpenMenu,
  subViewTitle,
  onBackFromSubView
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isOnline] = useState(navigator.onLine);

  const alertasPendentes = alertas.filter(a => !a.resolvido);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#090D16]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pt-3 pb-3">
        {subViewTitle ? (
          /* Header específico de Sub-View (como Tela Direita da Referência) */
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackFromSubView}
                className="p-1 -ml-1 text-slate-200 hover:text-white active-press"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-none">
                {subViewTitle}
              </h1>
            </div>

            <button
              onClick={() => setShowNotifications(true)}
              className="p-1.5 text-slate-300 hover:text-white active-press"
              aria-label="Opções"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        ) : (
          /* Header Principal (como Tela Esquerda da Referência) */
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Canto Superior Esquerdo: Menu Hambúrguer + Logo 3D + Nome Fiscaliz.IA */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={onOpenMenu}
                className="p-1.5 -ml-1 text-slate-300 hover:text-white active-press"
                aria-label="Menu Lateral"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div className="relative flex-shrink-0">
                <img
                  src="/app-icon.png"
                  alt="Fiscaliz.IA.lab"
                  className="w-8 h-8 rounded-xl object-cover border border-amber-500/30 shadow-glass-glow-gold bg-slate-900"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-extrabold text-white tracking-tight leading-none truncate">
                    Fiscalização Seduc
                  </h1>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    GPR
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate flex items-center gap-1">
                  <span>Fiscaliz.IA.lab</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-emerald-400 font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
                </p>
              </div>
            </div>

            {/* Canto Superior Direito: Logo Secretaria de Educação com mapa do Piauí + Sino */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-8 px-2 py-0.5 rounded-xl bg-slate-900/70 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <img
                  src="/logo-piaui-mapa.png"
                  alt="SEDUC Piauí"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo-seduc-piaui.png';
                  }}
                  className="h-6 w-auto object-contain max-w-[80px]"
                  title="Secretaria de Educação - Governo do Piauí"
                />
              </div>

              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-xl bg-slate-800/80 border border-white/10 active-press text-slate-300 hover:text-white"
                aria-label="Notificações"
              >
                <Bell className="w-4 h-4 text-orange-400" />
                {alertasPendentes.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-glass-glow-orange border border-slate-900">
                    {alertasPendentes.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modal de Notificações */}
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
