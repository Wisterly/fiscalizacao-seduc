package br.com.gprlab.fiscalia;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "AppUpdateManager")
public class AppUpdateManagerPlugin extends Plugin {
    private static final String TAG = "AppUpdateManager";
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private File lastDownloadedApk = null;

    /**
     * Retorna informações sobre a versão atual instalada no aparelho.
     */
    @PluginMethod
    public void getAppInfo(PluginCall call) {
        try {
            Context context = getContext();
            PackageManager pm = context.getPackageManager();
            PackageInfo pInfo = pm.getPackageInfo(context.getPackageName(), 0);

            long versionCode;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                versionCode = pInfo.getLongVersionCode();
            } else {
                versionCode = pInfo.versionCode;
            }

            boolean canRequestInstalls = true;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                canRequestInstalls = pm.canRequestPackageInstalls();
            }

            JSObject ret = new JSObject();
            ret.put("versionCode", versionCode);
            ret.put("versionName", pInfo.versionName != null ? pInfo.versionName : "1.0.0");
            ret.put("packageName", context.getPackageName());
            ret.put("canRequestPackageInstalls", canRequestInstalls);
            ret.put("platform", "android");
            ret.put("osVersion", Build.VERSION.RELEASE);
            ret.put("sdkInt", Build.VERSION.SDK_INT);

            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Erro ao obter dados do aplicativo", e);
            call.reject("Erro ao obter dados do aplicativo: " + e.getMessage(), e);
        }
    }

    /**
     * Abre a tela de configurações do Android para permitir a instalação de fontes desconhecidas.
     */
    @PluginMethod
    public void openInstallPermissionSettings(PluginCall call) {
        try {
            Context context = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!context.getPackageManager().canRequestPackageInstalls()) {
                    Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    intent.setData(Uri.parse("package:" + context.getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(intent);
                }
            }
            call.resolve();
        } catch (Exception e) {
            Log.e(TAG, "Erro ao abrir configurações de permissão", e);
            call.reject("Erro ao abrir configurações: " + e.getMessage(), e);
        }
    }

    /**
     * Realiza o download do APK em background emitindo eventos de progresso e dispara o instalador nativo.
     */
    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.trim().isEmpty()) {
            call.reject("URL do APK não informada.");
            return;
        }

        executor.execute(() -> {
            HttpURLConnection connection = null;
            InputStream input = null;
            FileOutputStream output = null;

            try {
                Context context = getContext();
                File targetDir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);
                if (targetDir == null) {
                    targetDir = context.getCacheDir();
                }

                if (!targetDir.exists()) {
                    targetDir.mkdirs();
                }

                File apkFile = new File(targetDir, "Fiscal.IA-update.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                connection = openConnectionWithRedirects(apkUrl);
                int responseCode = connection.getResponseCode();
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    throw new Exception("Falha HTTP ao baixar APK: Código " + responseCode);
                }

                long fileLength = connection.getContentLengthLong();
                input = connection.getInputStream();
                output = new FileOutputStream(apkFile);

                byte[] data = new byte[8192];
                long total = 0;
                int count;
                int lastReportedProgress = -1;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    int progress = (fileLength > 0) ? (int) ((total * 100) / fileLength) : -1;
                    if (progress != lastReportedProgress && (progress % 2 == 0 || progress == 100)) {
                        lastReportedProgress = progress;
                        final int currentProgress = progress;
                        final long currentTotal = total;
                        final long currentFileLength = fileLength;

                        mainHandler.post(() -> {
                            JSObject eventData = new JSObject();
                            eventData.put("progress", currentProgress);
                            eventData.put("downloadedBytes", currentTotal);
                            eventData.put("totalBytes", currentFileLength);
                            notifyListeners("downloadProgress", eventData);
                        });
                    }
                }

                output.flush();
                output.close();
                output = null;

                input.close();
                input = null;

                lastDownloadedApk = apkFile;

                // Notifica que o download foi concluído
                mainHandler.post(() -> {
                    JSObject completeData = new JSObject();
                    completeData.put("success", true);
                    completeData.put("filePath", apkFile.getAbsolutePath());
                    completeData.put("fileSize", apkFile.length());
                    notifyListeners("downloadComplete", completeData);
                });

                // Dispara a Intent nativa de instalação do Android
                mainHandler.post(() -> {
                    try {
                        triggerInstallIntent(apkFile);
                        JSObject result = new JSObject();
                        result.put("success", true);
                        result.put("message", "Instalador nativo disparado com sucesso.");
                        call.resolve(result);
                    } catch (Exception ex) {
                        Log.e(TAG, "Erro ao disparar intent de instalação", ex);
                        call.reject("Erro ao abrir instalador do Android: " + ex.getMessage(), ex);
                    }
                });

            } catch (Exception e) {
                Log.e(TAG, "Erro durante download do APK", e);
                mainHandler.post(() -> {
                    JSObject errorData = new JSObject();
                    errorData.put("error", e.getMessage());
                    notifyListeners("downloadError", errorData);
                    call.reject("Falha no download da atualização: " + e.getMessage(), e);
                });
            } finally {
                try {
                    if (output != null) output.close();
                    if (input != null) input.close();
                } catch (Exception ignored) {}
                if (connection != null) connection.disconnect();
            }
        });
    }

    /**
     * Permite reinstalar ou redisparar a instalação do último APK baixado.
     */
    @PluginMethod
    public void installLastDownloaded(PluginCall call) {
        if (lastDownloadedApk == null || !lastDownloadedApk.exists()) {
            call.reject("Nenhum arquivo de atualização baixado recentemente.");
            return;
        }

        try {
            triggerInstallIntent(lastDownloadedApk);
            JSObject res = new JSObject();
            res.put("success", true);
            call.resolve(res);
        } catch (Exception e) {
            call.reject("Falha ao abrir instalador: " + e.getMessage(), e);
        }
    }

    /**
     * Cria e dispara a Intent ACTION_VIEW com permissão FileProvider.
     */
    private void triggerInstallIntent(File apkFile) throws Exception {
        if (!apkFile.exists() || apkFile.length() == 0) {
            throw new Exception("O arquivo APK baixado está vazio ou inexistente.");
        }

        Context context = getContext();
        String authority = context.getPackageName() + ".fileprovider";
        Uri apkUri = FileProvider.getUriForFile(context, authority, apkFile);

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(apkUri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

        context.startActivity(intent);
    }

    /**
     * Abre conexão HTTP com suporte robusto a múltiplos redirects (necessário para GitHub Releases).
     */
    private HttpURLConnection openConnectionWithRedirects(String urlString) throws Exception {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(25000);
        conn.setReadTimeout(45000);
        conn.setRequestProperty("User-Agent", "FiscalIA-Android-OTA");

        int status = conn.getResponseCode();
        int redirects = 0;

        while ((status == HttpURLConnection.HTTP_MOVED_TEMP ||
                status == HttpURLConnection.HTTP_MOVED_PERM ||
                status == HttpURLConnection.HTTP_SEE_OTHER ||
                status == 307 || status == 308) && redirects < 8) {

            String newUrl = conn.getHeaderField("Location");
            if (newUrl == null || newUrl.isEmpty()) {
                break;
            }

            conn.disconnect();
            url = new URL(newUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setInstanceFollowRedirects(true);
            conn.setConnectTimeout(25000);
            conn.setReadTimeout(45000);
            conn.setRequestProperty("User-Agent", "FiscalIA-Android-OTA");

            status = conn.getResponseCode();
            redirects++;
        }

        return conn;
    }
}
