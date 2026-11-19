import { registerPlugin, Capacitor, PluginListenerHandle } from '@capacitor/core';

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  latestBuild: number;
  currentVersion: string;
  currentBuild: number;
  downloadUrl: string;
  changelog: string[];
}

export interface VersionMetadata {
  version: string;
  buildNumber: number;
  releaseDate: string;
  minRequiredVersion?: string;
  downloadUrl?: string;
  apkUrl?: string;
  appName?: string;
  packageName?: string;
  changelog: string[];
  mandatory?: boolean;
}

export interface AppInfo {
  versionCode: number;
  versionName: string;
  packageName: string;
  canRequestPackageInstalls: boolean;
  canInstall?: boolean;
  platform: string;
}

export interface AppUpdateManagerPlugin {
  getAppVersion(): Promise<{ versionName: string; versionCode: number; packageName: string }>;
  getAppInfo(): Promise<AppInfo>;
  checkInstallPermission(): Promise<{ canInstall: boolean }>;
  requestInstallPermission(): Promise<void>;
  openInstallPermissionSettings(): Promise<void>;
  downloadAndInstall(options: { url: string }): Promise<{ success: boolean; message: string }>;
  downloadViaSystemAndCloseApp(options: { url: string }): Promise<{ success: boolean; message: string }>;
  exitApp(): Promise<void>;
  installLastDownloaded(): Promise<{ success: boolean }>;
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (event: { percent: number; progress?: number; downloadedBytes?: number; totalBytes?: number }) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'downloadComplete',
    listenerFunc: (event: { success: boolean; filePath: string }) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'downloadError',
    listenerFunc: (event: { error: string }) => void
  ): Promise<PluginListenerHandle>;
  removeAllListeners(): Promise<void>;
}

export const AppUpdateManager = registerPlugin<AppUpdateManagerPlugin>('AppUpdateManager');

export const GITHUB_REPO_URL = 'https://raw.githubusercontent.com/Wisterly/fiscalizacao-seduc';
export const VERCEL_APP_URL = 'https://fiscalizacao-seduc.vercel.app';
export const DEFAULT_APK_DOWNLOAD_URL =
  'https://github.com/Wisterly/fiscalizacao-seduc/releases/download/apk-latest/Fiscal.IA.apk';

export const CURRENT_APP_VERSION = '1.0.47';
export const CURRENT_BUILD_NUMBER = 48;

/**
 * Busca os metadados de versão com fallback em múltiplos canais (GitHub API -> Vercel -> GitHub Raw -> Local)
 */
async function fetchRemoteVersionMetadata(): Promise<VersionMetadata | null> {
  const timestamp = Date.now();
  const endpoints = [
    `https://api.github.com/repos/Wisterly/fiscalizacao-seduc/contents/version.json?ref=main&_t=${timestamp}`,
    `${VERCEL_APP_URL}/version.json?_t=${timestamp}`,
    `${GITHUB_REPO_URL}/main/version.json?_t=${timestamp}`,
    `/version.json?_t=${timestamp}`
  ];

  for (const url of endpoints) {
    try {
      const isGhApi = url.includes('api.github.com');
      const response = await fetch(url, {
        cache: 'no-store',
        headers: isGhApi ? { Accept: 'application/vnd.github.v3.raw' } : undefined
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.buildNumber) {
          return data as VersionMetadata;
        }
      }
    } catch {
      // Tenta o próximo endpoint
    }
  }

  return null;
}

/**
 * Consulta atualizações na CDN do GitHub / Vercel.
 */
export async function checkForAppUpdates(): Promise<UpdateInfo | null> {
  try {
    const isNative = Capacitor.isNativePlatform();
    const remote = await fetchRemoteVersionMetadata();
    if (!remote) return null;

    let currentBuild = CURRENT_BUILD_NUMBER;
    let currentVersion = CURRENT_APP_VERSION;

    if (isNative) {
      try {
        const info = await AppUpdateManager.getAppVersion();
        currentBuild = Number(info.versionCode) || 1;
        currentVersion = info.versionName || '1.0.0';
      } catch (e) {
        console.warn('Erro ao chamar plugin nativo getAppVersion:', e);
      }
    }

    if (remote.buildNumber > currentBuild) {
      return {
        hasUpdate: true,
        latestVersion: remote.version,
        latestBuild: remote.buildNumber,
        currentVersion,
        currentBuild,
        downloadUrl: remote.downloadUrl || remote.apkUrl || DEFAULT_APK_DOWNLOAD_URL,
        changelog: remote.changelog || []
      };
    }

    return null;
  } catch (error) {
    console.warn('Erro ao verificar atualizações do app:', error);
    return null;
  }
}

/**
 * Dispara o download e instalação nativa com callback de progresso (conforme Prompt Mestre).
 */
export async function downloadAndInstallUpdate(
  url: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    window.open(url || DEFAULT_APK_DOWNLOAD_URL, '_system');
    return;
  }

  let listener: PluginListenerHandle | null = null;
  try {
    if (onProgress) {
      listener = await AppUpdateManager.addListener('downloadProgress', (data) => {
        onProgress(data.percent);
      });
    }

    await AppUpdateManager.downloadAndInstall({ url: url || DEFAULT_APK_DOWNLOAD_URL });
  } finally {
    if (listener) {
      await listener.remove();
    }
  }
}

/**
 * Função de consulta avançada para integração com o UpdateModal e ConfigView.
 */
export async function checkForUpdate(): Promise<{
  hasUpdate: boolean;
  metadata: VersionMetadata | null;
  installed: AppInfo;
  error?: string;
}> {
  let installed: AppInfo = {
    versionCode: CURRENT_BUILD_NUMBER,
    versionName: CURRENT_APP_VERSION,
    packageName: 'br.com.gprlab.fiscalia',
    canRequestPackageInstalls: true,
    platform: Capacitor.getPlatform()
  };

  if (Capacitor.isNativePlatform()) {
    try {
      installed = await AppUpdateManager.getAppInfo();
    } catch (e) {
      // Ignora erro nativo no fallback
    }
  }

  try {
    const metadata = await fetchRemoteVersionMetadata();
    if (!metadata) {
      throw new Error('Não foi possível obter os metadados de versão da nuvem.');
    }

    const hasUpdate = metadata.buildNumber > installed.versionCode;

    return {
      hasUpdate,
      metadata,
      installed
    };
  } catch (err: any) {
    return {
      hasUpdate: false,
      metadata: null,
      installed,
      error: err?.message || 'Erro de conexão'
    };
  }
}

export async function startAppUpdate(
  apkUrl: string,
  onProgress?: (progress: number, downloadedBytes: number, totalBytes: number) => void
): Promise<{ success: boolean; message: string }> {
  if (!Capacitor.isNativePlatform()) {
    window.open(apkUrl || DEFAULT_APK_DOWNLOAD_URL, '_blank');
    return { success: true, message: 'Download iniciado no navegador web.' };
  }

  let progressListener: PluginListenerHandle | null = null;

  try {
    if (onProgress) {
      progressListener = await AppUpdateManager.addListener('downloadProgress', (event) => {
        onProgress(
          event.percent,
          event.downloadedBytes || 0,
          event.totalBytes || 0
        );
      });
    }

    const targetUrl = apkUrl || DEFAULT_APK_DOWNLOAD_URL;
    return await AppUpdateManager.downloadAndInstall({ url: targetUrl });
  } finally {
    if (progressListener) {
      await progressListener.remove();
    }
  }
}

export async function requestInstallPermission(): Promise<void> {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    await AppUpdateManager.requestInstallPermission();
  }
}

export async function downloadViaSystemAndCloseApp(url?: string): Promise<void> {
  const targetUrl = url || DEFAULT_APK_DOWNLOAD_URL;
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      await AppUpdateManager.downloadViaSystemAndCloseApp({ url: targetUrl });
      return;
    } catch (e) {
      console.warn('Falha no download via sistema Android:', e);
    }
  }

  // Fallback para navegador
  window.open(targetUrl, '_system');
}

export async function closeApp(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AppUpdateManager.exitApp();
    } catch (e) {
      console.warn('Erro ao fechar aplicativo:', e);
    }
  }
}

export async function getInstalledAppInfo(): Promise<AppInfo> {
  if (Capacitor.isNativePlatform()) {
    try {
      return await AppUpdateManager.getAppInfo();
    } catch (e) {
      // fallback
    }
  }
  return {
    versionCode: 1,
    versionName: '1.0.0',
    packageName: 'br.com.gprlab.fiscalia',
    canRequestPackageInstalls: true,
    platform: 'web'
  };
}
