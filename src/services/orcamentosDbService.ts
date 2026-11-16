// Serviço IndexedDB dedicado para persistência offline de anexos manuais
// de Orçamentos e Ordens de Serviço (Seção 6.2 do Prompt Mestre)

const DB_NAME = 'db_orcamentos_os';
const STORE_NAME = 'anexos_obras';

export interface LocalAttachmentRecord {
  key: string; // `${obraId}_${tipo}`
  obraId: string;
  tipo: 'orcamento' | 'os';
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalAttachment(
  obraId: string,
  tipo: 'orcamento' | 'os',
  file: File
): Promise<LocalAttachmentRecord> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const record: LocalAttachmentRecord = {
        key: `${obraId}_${tipo}`,
        obraId,
        tipo,
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl: String(reader.result || ''),
        uploadedAt: new Date().toISOString()
      };

      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);

      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(tx.error);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function getLocalAttachment(
  obraId: string,
  tipo: 'orcamento' | 'os'
): Promise<LocalAttachmentRecord | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(`${obraId}_${tipo}`);
      req.onsuccess = () => resolve((req.result as LocalAttachmentRecord) || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getAllLocalAttachmentsMap(): Promise<Record<string, LocalAttachmentRecord>> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result as LocalAttachmentRecord[]) || [];
        const map: Record<string, LocalAttachmentRecord> = {};
        list.forEach((item) => {
          map[item.key] = item;
        });
        resolve(map);
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

export async function deleteLocalAttachment(
  obraId: string,
  tipo: 'orcamento' | 'os'
): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(`${obraId}_${tipo}`);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
