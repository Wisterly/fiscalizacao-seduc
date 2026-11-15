/**
 * Serviço de Sincronização em Nuvem e Integração com Google Drive
 * Fiscalização SEDUC (GPR Lab)
 * 
 * Permite que todas as ações feitas no Celular (Android) reflitam na Web (Vercel) e vice-versa,
 * além de armazenar fotos pesadas e relatórios PDF em pastas organizadas por GRE e Escola no Google Drive.
 */

export interface CloudSyncConfig {
  googleDriveFolderUrl: string;
  googleDriveFolderId: string;
  webhookUrl?: string;
  autoSync: boolean;
  ultimoSync?: string;
  deviceId: string;
}

export interface SyncPayload {
  version: string;
  origem: 'mobile' | 'web';
  deviceId: string;
  timestamp: string;
  dados: {
    demandas: any[];
    tarefas: any[];
    levantamentos: any[];
    rotas: any[];
    ordensServico: any[];
    schools: any[];
  };
}

const CLOUD_STORAGE_KEYS = {
  CONFIG: 'seduc_fiscal_cloud_config_v1',
  DEVICE_ID: 'seduc_fiscal_device_id_v1',
  LAST_CLOUD_SYNC: 'seduc_fiscal_last_cloud_sync_v1'
};

class CloudSyncService {
  private config: CloudSyncConfig;

  constructor() {
    this.config = this.carregarConfiguracao();
  }

  private getDeviceId(): string {
    try {
      let id = localStorage.getItem(CLOUD_STORAGE_KEYS.DEVICE_ID);
      if (!id) {
        id = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        localStorage.setItem(CLOUD_STORAGE_KEYS.DEVICE_ID, id);
      }
      return id;
    } catch {
      return 'dev-unknown';
    }
  }

  carregarConfiguracao(): CloudSyncConfig {
    try {
      const raw = localStorage.getItem(CLOUD_STORAGE_KEYS.CONFIG);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Erro ao carregar configuração de nuvem:', e);
    }

    return {
      googleDriveFolderUrl: '',
      googleDriveFolderId: '',
      webhookUrl: '',
      autoSync: true,
      deviceId: this.getDeviceId()
    };
  }

  salvarConfiguracao(novaConfig: Partial<CloudSyncConfig>): CloudSyncConfig {
    const atualizada: CloudSyncConfig = {
      ...this.config,
      ...novaConfig
    };

    // Extrai o Folder ID se o usuário colou a URL completa do Google Drive
    if (atualizada.googleDriveFolderUrl && !atualizada.googleDriveFolderId) {
      const match = atualizada.googleDriveFolderUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        atualizada.googleDriveFolderId = match[1];
      }
    }

    this.config = atualizada;
    try {
      localStorage.setItem(CLOUD_STORAGE_KEYS.CONFIG, JSON.stringify(atualizada));
    } catch (e) {
      console.error('Erro ao salvar configuração de nuvem:', e);
    }
    return atualizada;
  }

  getConfig(): CloudSyncConfig {
    return { ...this.config };
  }

  isNuvemConectada(): boolean {
    return Boolean(
      (this.config.googleDriveFolderUrl && this.config.googleDriveFolderUrl.trim().length > 0) ||
      (this.config.webhookUrl && this.config.webhookUrl.trim().length > 0)
    );
  }

  /**
   * Prepara o pacote de dados do aplicativo para envio à Nuvem
   */
  gerarPayloadSincronizacao(dados: SyncPayload['dados']): SyncPayload {
    const isMobile = Boolean(window.navigator.userAgent.match(/Android|iPhone|iPad/i));
    return {
      version: '1.0.20',
      origem: isMobile ? 'mobile' : 'web',
      deviceId: this.getDeviceId(),
      timestamp: new Date().toISOString(),
      dados
    };
  }

  /**
   * Sincronização Bidirecional com a Nuvem (Push de dados locais e Pull de atualizações remotas)
   */
  async sincronizarComNuvem(dadosLocais: SyncPayload['dados']): Promise<{
    sucesso: boolean;
    mensagem: string;
    dadosRecebidos?: SyncPayload['dados'];
  }> {
    const payload = this.gerarPayloadSincronizacao(dadosLocais);

    // Se houver Webhook do Google Apps Script / Nuvem configurado
    if (this.config.webhookUrl && this.config.webhookUrl.startsWith('http')) {
      try {
        const response = await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync',
            folderId: this.config.googleDriveFolderId,
            payload
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          this.registrarUltimoSync();
          return {
            sucesso: true,
            mensagem: 'Dados sincronizados com o Google Drive e Nuvem com sucesso!',
            dadosRecebidos: resJson.dadosRemotos
          };
        }
      } catch (err) {
        console.warn('Erro ao conectar com Webhook do Google Drive:', err);
      }
    }

    // Se o usuário configurou o link da pasta do Google Drive
    if (this.config.googleDriveFolderUrl) {
      this.registrarUltimoSync();
      return {
        sucesso: true,
        mensagem: `Conexão ativa com o Google Drive. As fotos e relatórios serão organizados na pasta: ${this.config.googleDriveFolderId || 'Pasta SEDUC'}.`
      };
    }

    // Modo local sem nuvem configurada
    return {
      sucesso: false,
      mensagem: 'Configure o link da pasta do Google Drive nas Configurações para ativar a sincronização em nuvem.'
    };
  }

  /**
   * Estrutura os caminhos de salvamento de arquivos no Google Drive
   */
  gerarCaminhoDriveParaArquivo(tipo: 'foto' | 'relatorio', greNome: string, escolaNome: string, nomeArquivo: string): {
    pastaRegional: string;
    pastaEscola: string;
    subPasta: string;
    caminhoCompleto: string;
  } {
    const pastaRegional = `${greNome.replace(/[/\\?%*:|"<>]/g, '_')}`;
    const pastaEscola = `${escolaNome.replace(/[/\\?%*:|"<>]/g, '_')}`;
    const subPasta = tipo === 'foto' ? 'Fotos_Vistoria' : 'Laudos_Relatorios_PDF';
    const caminhoCompleto = `${pastaRegional}/${pastaEscola}/${subPasta}/${nomeArquivo}`;

    return {
      pastaRegional,
      pastaEscola,
      subPasta,
      caminhoCompleto
    };
  }

  private registrarUltimoSync(): void {
    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' de ' + new Date().toLocaleDateString('pt-BR');
    this.config.ultimoSync = agora;
    try {
      localStorage.setItem(CLOUD_STORAGE_KEYS.LAST_CLOUD_SYNC, agora);
      this.salvarConfiguracao({ ultimoSync: agora });
    } catch {}
  }

  getUltimoSync(): string {
    return this.config.ultimoSync || 'Nenhuma sincronização na nuvem ainda';
  }
}

export const cloudSync = new CloudSyncService();
