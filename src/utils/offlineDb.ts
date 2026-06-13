import { PlaybookData } from "../types";

const DB_NAME = "cna_playbook_db";
const STORE_NAME = "playbook_data_store";
const DB_VERSION = 1;

export function initOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB opening error:", event);
      reject(new Error("Failed to open offline database."));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function savePlaybookOffline(data: PlaybookData): Promise<void> {
  try {
    const db = await initOfflineDb();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const payload = {
        id: "current_playbook",
        playbook: data,
        syncedAt: new Date().toISOString()
      };
      
      // Attempt put
      const request = store.put(payload);

      request.onsuccess = () => {
        // Also keep local storage in sync as multiple-channel safety redundancy
        try {
          localStorage.setItem("offline_playbook_current", JSON.stringify(data));
          localStorage.setItem("offline_playbook_synced_at", payload.syncedAt);
        } catch (e) {
          // ignore localStorage full/disabled errors
        }
        resolve();
      };
      request.onerror = (e) => {
        console.error("Put request on IndexedDB failed", e);
        reject(new Error("Failed to write to IndexedDB store."));
      };
    });
  } catch (err) {
    console.warn("IndexedDB Save failed, using LocalStorage fallback directly:", err);
    try {
      localStorage.setItem("offline_playbook_current", JSON.stringify(data));
      localStorage.setItem("offline_playbook_synced_at", new Date().toISOString());
    } catch (e) {
      console.error("LocalStorage backup write failed", e);
    }
  }
}

export async function getPlaybookOffline(): Promise<{ playbook: PlaybookData; syncedAt: string } | null> {
  try {
    if (typeof indexedDB === "undefined") {
      return getLocalStorageFallback();
    }
    const db = await initOfflineDb();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("current_playbook");

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        if (result && result.playbook) {
          resolve({ playbook: result.playbook, syncedAt: result.syncedAt });
        } else {
          resolve(getLocalStorageFallback());
        }
      };
      request.onerror = () => {
        resolve(getLocalStorageFallback());
      };
    });
  } catch (err) {
    console.warn("IndexedDB Load failed, falling back to LocalStorage:", err);
    return getLocalStorageFallback();
  }
}

function getLocalStorageFallback(): { playbook: PlaybookData; syncedAt: string } | null {
  try {
    const localData = localStorage.getItem("offline_playbook_current");
    const localTime = localStorage.getItem("offline_playbook_synced_at");
    if (localData) {
      return {
        playbook: JSON.parse(localData),
        syncedAt: localTime || new Date().toISOString()
      };
    }
  } catch (e) {
    console.error("LocalStorage fallback read failed", e);
  }
  return null;
}
