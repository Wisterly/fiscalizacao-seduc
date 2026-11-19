import { FotoLevantamento } from '../types';

export interface ReportDraft {
  escolaId: string;
  levantamentoId?: string; // Se estiver reeditando um relatório já concluído
  dataHora: string;
  motivoVisita: string;
  observacoesDiretora: string;
  ambientesQuantitativo: Record<string, number>;
  fotos: FotoLevantamento[];
  updatedAt: number; // Timestamp em ms
  createdAt: number;
}

const DB_NAME = 'db_vistoria_drafts_v1';
const STORE_NAME = 'report_drafts';
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24 Horas Estritas conforme solicitado pelo usuário

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não suportado'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'escolaId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const reportDraftService = {
  /**
   * Salva ou atualiza um rascunho em background no IndexedDB
   */
  async saveDraft(draft: Omit<ReportDraft, 'updatedAt'> & { updatedAt?: number }): Promise<void> {
    try {
      const db = await openDatabase();
      const record: ReportDraft = {
        ...draft,
        createdAt: draft.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Falha ao salvar rascunho no IndexedDB:', err);
    }
  },

  /**
   * Recupera o rascunho de uma unidade escolar se estiver dentro do limite de 24h
   */
  async getDraft(escolaId: string): Promise<ReportDraft | null> {
    try {
      const db = await openDatabase();
      return new Promise<ReportDraft | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(escolaId);

        req.onsuccess = async () => {
          const draft = req.result as ReportDraft | undefined;
          if (!draft) {
            resolve(null);
            return;
          }

          // Verifica se o rascunho ultrapassou as 24 horas (TTL)
          const agora = Date.now();
          const idadeMs = agora - (draft.updatedAt || draft.createdAt || 0);

          if (idadeMs > DRAFT_TTL_MS) {
            // Expirou: limpa automaticamente do sistema
            await reportDraftService.deleteDraft(escolaId);
            resolve(null);
          } else {
            resolve(draft);
          }
        };

        req.onerror = () => resolve(null);
      });
    } catch (err) {
      console.warn('Falha ao obter rascunho do IndexedDB:', err);
      return null;
    }
  },

  /**
   * Remove o rascunho de uma escola (usado após salvar com sucesso ou descarte voluntário)
   */
  async deleteDraft(escolaId: string): Promise<void> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(escolaId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('Falha ao deletar rascunho do IndexedDB:', err);
    }
  },

  /**
   * Varre e purga todos os rascunhos expirados com mais de 24 horas
   */
  async purgeExpiredDrafts(): Promise<number> {
    try {
      const db = await openDatabase();
      return new Promise<number>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
          const all = (req.result as ReportDraft[]) || [];
          const agora = Date.now();
          let expurgados = 0;

          all.forEach(draft => {
            const idadeMs = agora - (draft.updatedAt || draft.createdAt || 0);
            if (idadeMs > DRAFT_TTL_MS) {
              store.delete(draft.escolaId);
              expurgados++;
            }
          });

          resolve(expurgados);
        };

        req.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  },

  /**
   * Retorna tempo restante formatado para a expiração do rascunho
   */
  formatDraftRemainingTime(updatedAt: number): string {
    const agora = Date.now();
    const decorrido = agora - updatedAt;
    const restante = Math.max(0, DRAFT_TTL_MS - decorrido);
    const horas = Math.floor(restante / (1000 * 60 * 60));
    const minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) {
      return `${horas}h ${minutos}m restantes`;
    }
    return `${minutos} min restantes`;
  }
};
