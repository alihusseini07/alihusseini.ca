// Tiny IndexedDB blob store shared by <ImageSlot> and <VideoSlot>.
// Keyed by an arbitrary slot id (e.g. "cover-projects-0", "projects-0-main").
// Works on any deployed site (no sidecar / host bridge needed) and survives
// reloads even for multi-MB videos that localStorage can't hold.

const DB_NAME = 'portfolio-media';
const STORE = 'blobs';

let dbP: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  if (dbP) return dbP;
  dbP = new Promise((res, rej) => {
    let r: IDBOpenDBRequest;
    try {
      r = indexedDB.open(DB_NAME, 1);
    } catch (e) {
      return rej(e);
    }
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbP;
}

export async function getBlob(id: string): Promise<Blob | null> {
  try {
    const d = await db();
    return await new Promise((res) => {
      const t = d.transaction(STORE, 'readonly').objectStore(STORE).get(id);
      t.onsuccess = () => res((t.result as Blob) || null);
      t.onerror = () => res(null);
    });
  } catch {
    return null;
  }
}

export async function setBlob(id: string, blob: Blob): Promise<boolean> {
  try {
    const d = await db();
    return await new Promise((res) => {
      const t = d.transaction(STORE, 'readwrite').objectStore(STORE).put(blob, id);
      t.onsuccess = () => res(true);
      t.onerror = () => res(false);
    });
  } catch {
    return false;
  }
}

export async function delBlob(id: string): Promise<boolean> {
  try {
    const d = await db();
    return await new Promise((res) => {
      const t = d.transaction(STORE, 'readwrite').objectStore(STORE).delete(id);
      t.onsuccess = () => res(true);
      t.onerror = () => res(false);
    });
  } catch {
    return false;
  }
}
