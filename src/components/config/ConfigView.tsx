import React, { useState, useEffect } from 'react';
import {
  Settings,
  Smartphone,
  RefreshCw,
  Database,
  Shield,
  User,
  HardDrive,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { storage } from '../../services/storageService';
import {
  checkForUpdate,
  getInstalledAppInfo,
  AppInfo,
  VersionMetadata
} from '../../utils/appUpdater';

interface ConfigViewProps {
  onResetData: () => void;
  onOpenUpdateModal?: (metadata: VersionMetadata, installed: AppInfo) => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  onResetData,
  onOpenUpdateModal
}) => {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(storage.getLastSync());

  // Estado do OTA Update
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [installedInfo, setInstalledInfo] = useState<AppInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  useEffect(() => {
    getInstalledAppInfo().then((info) => setInstalledInfo(info));
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 800);
  };

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateStatus(null);

    try {
      const res = await checkForUpdate();
      setInstalledInfo(res.installed);

      if (res.hasUpdate && res.metadata) {
        setUpdateStatus('Nova versão encontrada!');
        if (onOpenUpdateModal) {
          onOpenUpdateModal(res.metadata, res.installed);
        }
      } else {
        setUpdateStatus('Você já está na versão mais recente!');
      }
    } catch (e: any) {
      setUpdateStatus('Não foi possível conectar à CDN de atualizações.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleConfirmReset = () => {
    if (
      window.confirm(
        'Deseja realmente restaurar os dados de fábrica do Piauí? Todas as 21 GREs, OS de 65% e alertas para a Gerência Naila serão restaurados.'
      )
    ) {
      onResetData();
    }
  };

  return (
    <div className="w-full pb-20">
      {/* Topo do Módulo */}
      <div className="px-4 pt-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight leading-none">
              Configurações & Sistema
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Fiscalização SEDUC • GPR Lab Mobile
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {/* SEÇÃO OTA: ATUALIZAÇÕES AUTOMÁTICAS IN-APP */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950 border border-amber-500/25 backdrop-blur-xl shadow-glass relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Atualizações In-App (OTA)</span>
            </div>
            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              CI/CD Ativo
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            O aplicativo detecta novas compilações automaticamente via GitHub Releases sem precisar de download manual ou lojas de apps.
          </p>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 mb-3">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Versão Instalada:</span>
              <span className="font-mono text-amber-300 font-bold text-xs">
                v{installedInfo?.versionName || '1.0.1'} (#{installedInfo?.versionCode || 2})
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Canal OTA:</span>
              <span className="font-mono text-cyan-300 font-bold text-xs">
                apk-latest
              </span>
            </div>
          </div>

          {updateStatus && (
            <div className={`p-2.5 rounded-xl text-xs mb-3 flex items-center gap-2 animate-fadeIn ${
              updateStatus.includes('Nova versão')
                ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
                : updateStatus.includes('mais recente')
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
                : 'bg-slate-800 border border-white/10 text-slate-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{updateStatus}</span>
            </div>
          )}

          <button
            onClick={handleManualCheckUpdate}
            disabled={checkingUpdate}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold active-press transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
            <span>{checkingUpdate ? 'Buscando Nova Versão na Nuvem...' : 'Verificar Atualizações Agora'}</span>
          </button>
        </div>

        {/* Perfil do Fiscal */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-extrabold text-base">
              EF
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Engenheiro Fiscal Responsável</h3>
              <p className="text-[11px] text-slate-400">CREA-PI Nº 18942-D / SEDUC-PI</p>
              <span className="inline-block text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.2 rounded border border-emerald-500/20 mt-0.5">
                Credencial Ativa • GPR Lab
              </span>
            </div>
          </div>
          <div className="space-y-1 text-xs text-slate-300 pt-2 border-t border-white/5">
            <p><strong>Lotação:</strong> Unidade de Gestão de Obras (UGO / SEDUC)</p>
            <p><strong>Gerência:</strong> Gerência de Infraestrutura Escolar (Naila)</p>
          </div>
        </div>

        {/* Plataforma Android & APK Ready */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <div className="flex items-center gap-2 text-xs font-bold text-white mb-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Plataforma Alvo: Android Mobile-First</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
            Aplicativo configurado na proporção exata de smartphone Android moderno com suporte nativo a Safe Area, Status Bar escura, feedback tátil e armazenamento Offline-First.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="p-2 rounded-xl bg-slate-800/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Pacote Android:</span>
              <span className="font-mono text-cyan-300 text-[10px]">br.com.gprlab.fiscalia</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/60 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Capacitor Engine:</span>
              <span className="font-mono text-teal-300 text-[10px]">v7.0.1 APK Ready</span>
            </div>
          </div>
        </div>

        {/* Sincronização Offline-First */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Persistência Offline-First</span>
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Ativo
            </span>
          </div>

          <p className="text-[11px] text-slate-300 mb-3">
            O aplicativo funciona 100% offline em municípios e povoados do interior sem cobertura de dados móveis. Os levantamentos, fotos e medições são gravados localmente e sincronizados assim que houver rede.
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <span className="text-[11px] text-slate-400">
              Última sincronização: <strong className="text-white">{lastSync}</strong>
            </span>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold active-press disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          </div>
        </div>

        {/* Redefinir Dados de Fábrica */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-white">Restaurar Seed do Piauí</h4>
              <p className="text-[11px] text-slate-400">Recarrega as 21 GREs, OS de 65% e alertas iniciais</p>
            </div>
            <button
              onClick={handleConfirmReset}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold active-press"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
