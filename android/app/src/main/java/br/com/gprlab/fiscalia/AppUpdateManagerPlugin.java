package br.com.gprlab.fiscalia;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "AppUpdateManager")
public class AppUpdateManagerPlugin extends Plugin {
    private static final String TAG = "AppUpdateManager";
    private boolean isDownloading = false;
    private File lastDownloadedApk = null;

    /**
     * Consulta versão do aplicativo instalado (conforme padrão do Prompt Mestre).
     */
    @PluginMethod
    public void getAppVersion(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            Context context = getContext();
            PackageInfo pInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.0.0");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                ret.put("versionCode", pInfo.getLongVersionCode());
            } else {
                ret.put("versionCode", pInfo.versionCode);
            }
            ret.put("packageName", context.getPackageName());
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao obter versão instalada", e);
            ret.put("versionName", "1.0.0");
            ret.put("versionCode", 1);
            ret.put("packageName", getContext().getPackageName());
            call.resolve(ret);
        }
    }

    /**
     * Consulta avançada de informações do aplicativo e status de permissão.
     */
    @PluginMethod
    public void getAppInfo(PluginCall call) {
        JSObject ret = new JSObject();
        try {
            Context context = getContext();
            PackageInfo pInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            long versionCode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }

            boolean canInstall = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                canInstall = context.getPackageManager().canRequestPackageInstalls();
            }

            ret.put("versionCode", versionCode);
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.0.0");
            ret.put("packageName", context.getPackageName());
            ret.put("canRequestPackageInstalls", canInstall);
            ret.put("canInstall", canInstall);
            ret.put("platform", "android");
            ret.put("sdkInt", Build.VERSION.SDK_INT);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao obter app info", e);
            ret.put("versionCode", 1);
            ret.put("versionName", "1.0.0");
            ret.put("packageName", getContext().getPackageName());
            ret.put("canRequestPackageInstalls", true);
            ret.put("canInstall", true);
            ret.put("platform", "android");
            call.resolve(ret);
        }
    }

    /**
     * Verifica se o aplicativo possui permissão para instalar fontes desconhecidas (Android 8+).
     */
    @PluginMethod
    public void checkInstallPermission(PluginCall call) {
        JSObject ret = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ret.put("canInstall", getContext().getPackageManager().canRequestPackageInstalls());
        } else {
            ret.put("canInstall", true);
        }
        call.resolve(ret);
    }

    /**
     * Solicita permissão para instalar fontes desconhecidas abrindo as configurações nativas.
     */
    @PluginMethod
    public void requestInstallPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!getContext().getPackageManager().canRequestPackageInstalls()) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
        }
        call.resolve();
    }

    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        requestInstallPermission(call);
    }

    /**
     * Realiza o download do APK em segundo plano e dispara o instalador oficial via FileProvider.
     */
    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String downloadUrl = call.getString("url");
        if (downloadUrl == null || downloadUrl.trim().isEmpty()) {
            call.reject("URL de download inválida ou vazia.");
            return;
        }

        if (isDownloading) {
            call.reject("Download já em andamento.");
            return;
        }

        isDownloading = true;

        new Thread(() -> {
            HttpURLConnection conn = null;
            InputStream in = null;
            FileOutputStream out = null;

            try {
                Context context = getContext();
                File downloadDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (downloadDir == null) {
                    downloadDir = context.getCacheDir();
                }

                if (!downloadDir.exists()) {
                    downloadDir.mkdirs();
                }

                File apkFile = new File(downloadDir, "app-update.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                // Seguir redirecionamentos HTTP do GitHub para AWS S3 (301, 302, 307, 308)
                String currentUrl = downloadUrl;
                int redirects = 0;
                while (redirects < 8) {
                    URL u = new URL(currentUrl);
                    conn = (HttpURLConnection) u.openConnection();
                    conn.setInstanceFollowRedirects(true);
                    conn.setConnectTimeout(20000);
                    conn.setReadTimeout(35000);
                    conn.setRequestProperty("User-Agent", "FiscalIA-OTA-AutoUpdate");
                    conn.connect();

                    int status = conn.getResponseCode();
                    if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
                        currentUrl = conn.getHeaderField("Location");
                        conn.disconnect();
                        redirects++;
                    } else {
                        break;
                    }
                }

                long totalBytes = conn.getContentLengthLong();
                in = new BufferedInputStream(conn.getInputStream(), 16384);
                out = new FileOutputStream(apkFile);

                byte[] buffer = new byte[8192];
                long downloadedBytes = 0;
                int readBytes;
                long lastNotify = 0;

                while ((readBytes = in.read(buffer)) != -1) {
                    downloadedBytes += readBytes;
                    out.write(buffer, 0, readBytes);
                    long now = System.currentTimeMillis();

                    if (now - lastNotify > 150 || (totalBytes > 0 && downloadedBytes >= totalBytes)) {
                        lastNotify = now;
                        int percent = (totalBytes > 0) ? (int) ((downloadedBytes * 100) / totalBytes) : -1;

                        JSObject p = new JSObject();
                        p.put("percent", percent);
                        p.put("progress", percent);
                        p.put("downloadedBytes", downloadedBytes);
                        p.put("totalBytes", totalBytes);
                        notifyListeners("downloadProgress", p);
                    }
                }

                out.flush();
                out.close();
                out = null;

                in.close();
                in = null;

                conn.disconnect();
                conn = null;
                isDownloading = false;
                lastDownloadedApk = apkFile;

                // Notifica conclusão
                JSObject completeEvent = new JSObject();
                completeEvent.put("success", true);
                completeEvent.put("filePath", apkFile.getAbsolutePath());
                notifyListeners("downloadComplete", completeEvent);

                // Executar instalação nativa na UI Thread
                if (getActivity() != null) {
                    getActivity().runOnUiThread(() -> triggerInstall(apkFile));
                } else {
                    triggerInstall(apkFile);
                }

                JSObject res = new JSObject();
                res.put("success", true);
                res.put("message", "Download concluído e instalador disparado.");
                call.resolve(res);

            } catch (Exception e) {
                isDownloading = false;
                Log.e(TAG, "Erro no download do APK", e);
                JSObject errEvent = new JSObject();
                errEvent.put("error", e.getMessage());
                notifyListeners("downloadError", errEvent);
                call.reject("Erro no download: " + e.getMessage(), e);
            } finally {
                try {
                    if (out != null) out.close();
                    if (in != null) in.close();
                } catch (Exception ignored) {}
                if (conn != null) conn.disconnect();
            }
        }).start();
    }

    /**
     * Redispara o instalador do último APK baixado.
     */
    @PluginMethod
    public void installLastDownloaded(PluginCall call) {
        if (lastDownloadedApk == null || !lastDownloadedApk.exists()) {
            call.reject("Nenhum arquivo baixado recentemente.");
            return;
        }

        try {
            triggerInstall(lastDownloadedApk);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Falha ao abrir instalador: " + e.getMessage(), e);
        }
    }

    /**
     * Dispara a Intent nativa ACTION_VIEW com permissão de leitura via FileProvider.
     */
    private void triggerInstall(File apkFile) {
        try {
            Context context = getContext();
            String authority = context.getPackageName() + ".fileprovider";
            Uri contentUri = FileProvider.getUriForFile(context, authority, apkFile);

            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(contentUri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception e) {
            Log.e(TAG, "Falha ao invocar FileProvider e Intent de instalação", e);
            e.printStackTrace();
        }
    }
}
