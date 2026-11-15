import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  Bell,
  Wifi,
  WifiOff,
  X,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  MoreVertical,
  Home,
  Map,
  ClipboardList,
  TrendingUp,
  Navigation,
  CheckSquare,
  FileSearch,
  Image as GalleryIcon,
  Settings
} from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOnline] = useState(navigator.onLine);

  const alertasPendentes = alertas.filter(a => !a.resolvido);

  const handleOpenMenuDrawer = () => {
    setIsMenuOpen(true);
    if (onOpenMenu) onOpenMenu();
  };

  const handleSelectMenuItem = (tabId: string) => {
    if (onNavigateToTab) {
      onNavigateToTab(tabId);
    }
    setIsMenuOpen(false);
  };

  const menuItems = [
    {
      id: 'inicio',
      label: 'Início',
      desc: 'Painel Geral & Módulos',
      icon: Home,
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10'
    },
    {
      id: 'vistorias',
      label: 'Vistorias & GREs',
      desc: '21 Regionais & Levantamentos',
      icon: Map,
      color: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10'
    },
    {
      id: 'orcamentos',
      label: 'Orçamentos & OS',
      desc: 'Contratos da Ata & Memoriais',
      icon: ClipboardList,
      color: 'text-amber-300',
      bgGlow: 'bg-amber-500/10'
    },
    {
      id: 'medicoes',
      label: 'Medições de Obras',
      desc: '% Medido & Saldos Contratuais',
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgGlow: 'bg-yellow-500/10'
    },
    {
      id: 'rotas',
      label: 'Rotas de Vistoria',
      desc: 'Calendário de Viagem & Diárias',
      icon: Navigation,
      color: 'text-cyan-300',
      bgGlow: 'bg-cyan-500/10'
    },
    {
      id: 'demandas',
      label: 'Central de Demandas',
      desc: 'Prazos & Pendências',
      icon: CheckSquare,
      color: 'text-orange-400',
      bgGlow: 'bg-orange-500/10',
      badge: alertasPendentes.length > 0 ? alertasPendentes.length : undefined
    },
    {
      id: 'processos',
      label: 'Acompanhar Processos SEI',
      desc: 'Medições, Diárias & Alertas',
      icon: FileSearch,
      color: 'text-purple-400',
      bgGlow: 'bg-purple-500/10'
    },
    {
      id: 'galeria',
      label: 'Galeria de Fotos',
      desc: 'Evidências Técnicas em Campo',
      icon: GalleryIcon,
      color: 'text-teal-400',
      bgGlow: 'bg-teal-500/10'
    },
    {
      id: 'config',
      label: 'Configurações',
      desc: 'Nuvem, Google Drive & Sistema',
      icon: Settings,
      color: 'text-slate-400',
      bgGlow: 'bg-slate-500/10'
    }
  ];

  return (
    <>
      <header 
        className="sticky top-0 z-40 w-full bg-[#090D16]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 pb-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      >
        {subViewTitle ? (
          /* Header específico de Sub-View */
          <div className="flex items-center justify-between max-w-full md:max-w-6xl xl:max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <button
                onClick={onBackFromSubView}
                className="p-1 -ml-1 text-slate-200 hover:text-white active-press"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
              </button>
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none">
                {subViewTitle}
              </h1>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleOpenMenuDrawer}
                className="p-1.5 text-slate-300 hover:text-white active-press"
                aria-label="Abrir Menu Lateral"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Header Principal */
          <div className="flex items-center justify-between max-w-full md:max-w-6xl xl:max-w-7xl mx-auto">
            {/* Canto Superior Esquerdo: Menu Hamburguer + Logo + Nome */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={handleOpenMenuDrawer}
                className="p-1.5 -ml-1 text-slate-300 hover:text-white active-press rounded-xl hover:bg-white/5"
                aria-label="Abrir Menu Lateral de Navegação"
                title="Abrir Menu Completo"
              >
                <Menu className="w-5 h-5 stroke-[2.2]" />
              </button>

              <div className="relative flex-shrink-0">
                <img
                  src="/app-icon.png"
                  alt="Fiscal.IA.lab - GPR"
                  className="w-8 h-8 rounded-xl object-cover border border-amber-500/30 shadow-glass-glow-gold bg-slate-900"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none truncate">
                    Fiscal.IA.lab
                  </h1>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    GPR
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate flex items-center gap-1">
                  <span>SEDUC Piauí</span>
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

      {/* ======================================================== */}
      {/* DRAWER LATERAL / MENU COMPLETO ACIONADO PELO BOTÃO MENU  */}
      {/* ======================================================== */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Fundo Backdrop Escurecido com Blur */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          {/* Painel Lateral Deslizante */}
          <div className="relative w-80 max-w-[88vw] h-full bg-[#0B1120] border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col z-10 overflow-hidden">
            {/* Topo do Menu Lateral */}
            <div className="p-4 border-b border-white/10 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src="/app-icon.png"
                  alt="Fiscal.IA.lab"
                  className="w-9 h-9 rounded-xl object-cover border border-amber-500/40 shadow-glass-glow-gold bg-slate-900"
                />
                <div>
                  <h3 className="font-extrabold text-white text-sm tracking-tight leading-none">
                    Fiscal.IA.lab
                  </h3>
                  <p className="text-[10px] text-amber-400 font-semibold mt-1">
                    SEDUC Piauí • GPR Obras
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white active-press"
                title="Fechar Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista dos 9 Módulos (Espelhando a Barra Inferior) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-1.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Módulos de Navegação
              </div>

              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMenuItem(item.id)}
                    className="w-full p-2.5 rounded-2xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 transition-all text-left flex items-center justify-between group active-press"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${item.bgGlow} border border-white/10 flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4.5 h-4.5 stroke-[2] ${item.color}`} />
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block leading-tight group-hover:text-amber-300 transition-colors">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge !== undefined && (
                        <span className="min-w-[18px] h-4.5 px-1.5 rounded-full bg-orange-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-glass-glow-orange">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Rodapé do Menu */}
            <div className="p-3.5 border-t border-white/10 bg-slate-950/90 text-center">
              <p className="text-[10px] text-slate-400">
                Fiscalização SEDUC • Versão 1.0.21
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Gerência de Prédios e Reformas (GPR)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificações */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 2rem)' }}
        >
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
                  <p className="text-xs text-slate-500 mt-1">Nenhum alerta pendente no momento.</p>
                </div>
              ) : (
                alertasPendentes.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-1.5 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                        <h4 className="font-semibold text-white text-xs leading-snug">
                          {alerta.titulo}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        {alerta.prioridade}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {alerta.descricao}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">
                        Resp: {alerta.responsavel}
                      </span>
                      <button
                        onClick={() => onResolverAlerta(alerta.id)}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Dar OK
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
