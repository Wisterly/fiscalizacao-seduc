import { registerPlugin, Capacitor, PluginListenerHandle } from '@capacitor/core';

export interface VersionMetadata {
  version: string;
  buildNumber: number;
  releaseDate: string;
  appName?: string;
  packageName?: string;
  apkUrl?: string;
  changelog: string[];
  minSupportedBuild?: number;
  mandatory?: boolean;
}

export interface AppInfo {
  versionCode: number;
  versionName: string;
  packageName: string;
  canRequestPackageInstalls: boolean;
  platform: string;
  osVersion?: string;
  sdkInt?: number;
}

export interface DownloadProgressEvent {
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
}

export interface AppUpdateManagerPlugin {
  getAppInfo(): Promise<AppInfo>;
  openInstallPermissionSettings(): Promise<void>;
  downloadAndInstall(options: { url: string; fileName?: string }): Promise<{ success: boolean; message: string }>;
  installLastDownloaded(): Promise<{ success: boolean }>;
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (event: DownloadProgressEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'downloadComplete',
    listenerFunc: (event: { success: boolean; filePath: string; fileSize: number }) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'downloadError',
    listenerFunc: (event: { error: string }) => void
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const AppUpdateManager = registerPlugin<AppUpdateManagerPlugin>('AppUpdateManager');

export const GITHUB_RAW_VERSION_URL =
  'https://raw.githubusercontent.com/Wisterly/fiscalizacao-seduc/main/version.json';

export const DEFAULT_APK_RELEASE_URL =
  'https://github.com/Wisterly/fiscalizacao-seduc/releases/download/apk-latest/Fiscal.IA.apk';

/**
 * Consulta a versão instalada localmente no dispositivo.
 */
export async function getInstalledAppInfo(): Promise<AppInfo> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      return await AppUpdateManager.getAppInfo();
    } catch (e) {
      console.warn('Erro ao chamar plugin nativo getAppInfo:', e);
    }
  }

  // Fallback para ambiente Web / Desktop
  return {
    versionCode: 1,
    versionName: '1.0.0',
    packageName: 'br.com.gprlab.fiscalia',
    canRequestPackageInstalls: true,
    platform: 'web'
  };
}

/**
 * Consulta a CDN do GitHub para obter os metadados mais recentes de versão.
 */
export async function fetchRemoteVersionMetadata(): Promise<VersionMetadata> {
  const timestamp = Date.now();
  const cdnUrl = `${GITHUB_RAW_VERSION_URL}?_t=${timestamp}`;

  try {
    const response = await fetch(cdnUrl, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ao consultar version.json na CDN.`);
    }

    const data: VersionMetadata = await response.json();
    return data;
  } catch (error) {
    // Fallback secundário tentando a raiz da aplicação (/version.json)
    try {
      const localResponse = await fetch(`/version.json?_t=${timestamp}`, { cache: 'no-store' });
      if (localResponse.ok) {
        return await localResponse.json();
      }
    } catch (e) {
      // Ignora erro do fallback secundário
    }

    throw error;
  }
}

/**
 * Checa se há uma versão mais recente disponível para download.
 */
export async function checkForUpdate(): Promise<{
  hasUpdate: boolean;
  metadata: VersionMetadata | null;
  installed: AppInfo;
  error?: string;
}> {
  const installed = await getInstalledAppInfo();

  try {
    const metadata = await fetchRemoteVersionMetadata();
    const hasUpdate = metadata.buildNumber > installed.versionCode;

    return {
      hasUpdate,
      metadata,
      installed
    };
  } catch (err: any) {
    console.warn('Não foi possível verificar atualizações OTA:', err);
    return {
      hasUpdate: false,
      metadata: null,
      installed,
      error: err?.message || 'Erro de conexão'
    };
  }
}

/**
 * Inicia o download e a instalação com emissão de progresso contínuo.
 */
export async function startAppUpdate(
  apkUrl: string,
  onProgress?: (progress: number, downloadedBytes: number, totalBytes: number) => void
): Promise<{ success: boolean; message: string }> {
  if (!Capacitor.isNativePlatform()) {
    // Se estiver na Web, abre o download do APK diretamente no navegador
    window.open(apkUrl || DEFAULT_APK_RELEASE_URL, '_blank');
    return { success: true, message: 'Download iniciado no navegador web.' };
  }

  let progressListener: PluginListenerHandle | null = null;

  try {
    if (onProgress) {
      progressListener = await AppUpdateManager.addListener(
        'downloadProgress',
        (event: DownloadProgressEvent) => {
          onProgress(event.progress, event.downloadedBytes, event.totalBytes);
        }
      );
    }

    const targetUrl = apkUrl && apkUrl.trim().length > 0 ? apkUrl : DEFAULT_APK_RELEASE_URL;
    const result = await AppUpdateManager.downloadAndInstall({ url: targetUrl });

    return result;
  } finally {
    if (progressListener) {
      await progressListener.remove();
    }
  }
}

/**
 * Abre a tela nativa de permissão para instalar fontes desconhecidas no Android.
 */
export async function requestInstallPermission(): Promise<void> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    await AppUpdateManager.openInstallPermissionSettings();
  }
}
