// IndexedDB utility for storing large CSV data
import { CSVRow, ExpertOpinion } from "../types";

const DB_NAME = "MicroAnalysisDB";
const DB_VERSION = 1;
const STORE_NAME = "csvData";

interface StoredData {
  id: string;
  rawData: CSVRow[];
  expertOpinions: ExpertOpinion[];
  timestamp: number;
}

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
};

// Save data to IndexedDB
export const saveDataToIndexedDB = async (
  rawData: CSVRow[],
  expertOpinions: ExpertOpinion[]
): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const data: StoredData = {
      id: "current_data",
      rawData,
      expertOpinions,
      timestamp: Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    return true;
  } catch (error) {
    console.error("Failed to save to IndexedDB:", error);
    return false;
  }
};

// Load data from IndexedDB
export const loadDataFromIndexedDB = async (): Promise<{
  rawData: CSVRow[];
  expertOpinions: ExpertOpinion[];
} | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const data = await new Promise<StoredData | null>((resolve, reject) => {
      const request = store.get("current_data");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (data) {
      return {
        rawData: data.rawData,
        expertOpinions: data.expertOpinions,
      };
    }

    return null;
  } catch (error) {
    console.error("Failed to load from IndexedDB:", error);
    return null;
  }
};

// Clear data from IndexedDB
export const clearDataFromIndexedDB = async (): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete("current_data");
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
    return true;
  } catch (error) {
    console.error("Failed to clear IndexedDB:", error);
    return false;
  }
};

// Check if data exists in IndexedDB
export const hasStoredData = async (): Promise<boolean> => {
  try {
    const data = await loadDataFromIndexedDB();
    return data !== null;
  } catch (error) {
    console.error("Failed to check stored data:", error);
    return false;
  }
};

// Fallback compression for localStorage (if needed)
export const compressAndStore = (key: string, data: unknown): boolean => {
  try {
    const jsonString = JSON.stringify(data);
    // Simple compression - in production you might want to use a library like LZ-string
    const compressed = jsonString; // Placeholder for actual compression
    localStorage.setItem(key, compressed);
    return true;
  } catch (error) {
    console.error("Failed to compress and store:", error);
    return false;
  }
};
