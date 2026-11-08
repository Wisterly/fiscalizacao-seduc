import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Settings
} from 'lucide-react';
import {
  VersionMetadata,
  AppInfo,
  startAppUpdate,
  requestInstallPermission
} from '../utils/appUpdater';

interface UpdateModalProps {
  metadata: VersionMetadata;
  installedInfo: AppInfo;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  metadata,
  installedInfo,
  onClose
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>('Pronto para atualizar');
  const [permissionAlert, setPermissionAlert] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleStartUpdate = async () => {
    // Se o Android exigir permissão de fontes desconhecidas
    if (installedInfo.platform === 'android' && installedInfo.canRequestPackageInstalls === false) {
      setPermissionAlert(true);
      await requestInstallPermission();
      return;
    }

    setIsDownloading(true);
    setErrorMessage(null);
    setDownloadProgress(0);
    setStatusText('Conectando ao servidor seguro de atualização...');

    try {
      const apkUrl = metadata.apkUrl || '';
      setStatusText('Baixando nova versão...');

      const result = await startAppUpdate(apkUrl, (progress, downloaded, total) => {
        setDownloadProgress(progress);
        setDownloadedBytes(downloaded);
        setTotalBytes(total);
        if (progress >= 100) {
          setStatusText('Download concluído! Abrindo instalador do Android...');
        } else {
          setStatusText(`Baixando atualização... ${progress}%`);
        }
      });

      if (result && result.success) {
        setStatusText('Instalador do Android acionado com sucesso!');
      }
    } catch (err: any) {
      console.error('Erro na atualização:', err);
      setErrorMessage(err?.message || 'Falha ao baixar a atualização. Verifique sua conexão.');
      setIsDownloading(false);
    }
  };

  const handleOpenBrowserFallback = () => {
    const url = metadata.apkUrl || 'https://github.com/Wisterly/fiscalizacao-seduc/releases/download/apk-latest/Fiscal.IA.apk';
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#090D16] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative text-white">
        {/* Glow Superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-400" />

        {/* Botão Fechar (caso não seja obrigatório) */}
        {!metadata.mandatory && !isDownloading && (
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Topo / Header Visual */}
        <div className="px-5 pt-6 pb-3 text-center flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-glass-glow-gold">
              <Sparkles className="w-7 h-7" />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider shadow-sm">
              OTA
            </span>
          </div>

          <h2 className="text-base font-extrabold text-white tracking-tight leading-snug">
            Nova Versão Disponível
          </h2>

          <div className="flex items-center gap-2 mt-1.5 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold">
              v{metadata.version} (Build #{metadata.buildNumber})
            </span>
            <span className="text-slate-400 text-[11px]">
              • Atual: #{installedInfo.versionCode}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mt-1">
            Lançada em {metadata.releaseDate || 'Novembro 2026'}
          </p>
        </div>

        {/* Corpo do Modal: Changelog e Notas */}
        <div className="px-5 py-2 space-y-3 max-h-56 overflow-y-auto no-scrollbar">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              O que há de novo nesta versão:
            </span>

            <ul className="space-y-1.5 text-xs text-slate-300">
              {metadata.changelog && metadata.changelog.length > 0 ? (
                metadata.changelog.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 text-[11px]">
                  Melhorias gerais de estabilidade, sincronização e interface.
                </li>
              )}
            </ul>
          </div>

          {/* Alerta de Permissão de Instalação (se necessário) */}
          {permissionAlert && (
            <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-500/30 text-xs text-orange-200 flex items-start gap-2 animate-fadeIn">
              <Settings className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-300">Permissão do Android Necessária</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Ative a opção &quot;Permitir desta fonte&quot; na tela de configurações que foi aberta, e toque em &quot;Atualizar Agora&quot; novamente.
                </p>
              </div>
            </div>
          )}

          {/* Mensagem de Erro (se houver) */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-200 flex items-start gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-300">Não foi possível baixar</p>
                <p className="text-[11px] text-slate-300 mt-0.5">{errorMessage}</p>
                <button
                  onClick={handleOpenBrowserFallback}
                  className="mt-1.5 text-[11px] font-bold text-cyan-400 underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Baixar APK direto pelo navegador
                </button>
              </div>
            </div>
          )}

          {/* Barra de Progresso Durante o Download */}
          {isDownloading && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2 animate-fadeIn shadow-glass-glow-turq">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  {statusText}
                </span>
                <span className="font-mono font-bold text-cyan-400">
                  {downloadProgress > 0 ? `${downloadProgress}%` : '...'}
                </span>
              </div>

              {/* Barra em Cápsula Neon */}
              <div className="w-full h-3 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 transition-all duration-300 shadow-glass-glow-turq"
                  style={{ width: `${Math.max(5, downloadProgress)}%` }}
                />
              </div>

              {totalBytes > 0 && (
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{formatBytes(downloadedBytes)} baixados</span>
                  <span>Total: {formatBytes(totalBytes)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="p-4 pt-3 border-t border-white/10 bg-slate-950/70 space-y-2">
          {!isDownloading ? (
            <>
              <button
                onClick={handleStartUpdate}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-extrabold text-xs shadow-glass-glow-gold hover:opacity-95 active-press flex items-center justify-center gap-2 transition-transform"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Atualizar Agora (1 Clique)</span>
              </button>

              {!metadata.mandatory && (
                <button
                  onClick={onClose}
                  className="w-full py-2 px-3 rounded-xl bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Lembrar Mais Tarde
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-1">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Instalação nativa direta e segura</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
