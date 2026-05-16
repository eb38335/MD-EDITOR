import type { StateStorage } from 'zustand/middleware';

// ── IndexedDB key-value adapter ────────────────────────────────────────────
const DB_NAME = 'md-editor-db';
const STORE_NAME = 'kv';
let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => { _db = req.result; resolve(req.result); };
    req.onerror = () => reject(req.error);
  });
}

export const idbStorage: StateStorage = {
  getItem: async (name) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(name);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },
  setItem: async (name, value) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  removeItem: async (name) => {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(name);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
};

// ── Storage backend preference (stored in a dedicated localStorage key) ────
export type StorageBackend = 'localStorage' | 'indexedDB';
export const STORAGE_BACKEND_KEY = 'md-editor-storage-backend';

export function getStorageBackend(): StorageBackend {
  return (localStorage.getItem(STORAGE_BACKEND_KEY) as StorageBackend) ?? 'localStorage';
}

// ── Proxy storage: reads backend preference each call ──────────────────────
export const proxyStorage: StateStorage = {
  getItem: async (name) => {
    if (getStorageBackend() === 'indexedDB') return idbStorage.getItem(name);
    return localStorage.getItem(name);
  },
  setItem: async (name, value) => {
    if (getStorageBackend() === 'indexedDB') return idbStorage.setItem(name, value);
    localStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    if (getStorageBackend() === 'indexedDB') return idbStorage.removeItem(name);
    localStorage.removeItem(name);
  },
};

// ── Migrate data between backends, then reload ────────────────────────────
const FILES_KEY = 'md-editor-files';

export async function migrateAndSwitch(to: StorageBackend): Promise<void> {
  const from = getStorageBackend();
  if (from === to) return;

  // Read from current backend
  let data: string | null = null;
  if (from === 'localStorage') {
    data = localStorage.getItem(FILES_KEY);
  } else {
    data = await idbStorage.getItem(FILES_KEY);
  }

  // Write to new backend
  if (data) {
    if (to === 'localStorage') {
      localStorage.setItem(FILES_KEY, data);
    } else {
      await idbStorage.setItem(FILES_KEY, data);
    }
  }

  localStorage.setItem(STORAGE_BACKEND_KEY, to);
  window.location.reload();
}
