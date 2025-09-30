interface CacheEntry {
  url: string;
  blob: Blob;
  timestamp: number;
}

interface GlobalImageCache {
  cache: Map<string, string>;
}

// Store cache on window object to persist across reloads
declare global {
  interface Window {
    __imageCache?: GlobalImageCache;
  }
}

class SimpleImageCache {
  private cache = new Map<string, string>();
  private dbName = 'BookImageCache';
  private storeName = 'images';
  private db: IDBDatabase | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initDB().then(() => {
      // Clean up expired entries when cache is initialized
      this.cleanupExpiredEntries();
    });
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'url' });
        }
      };
    });
  }

  private async cleanupExpiredEntries(): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      
      let deletedCount = 0;
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const entry = cursor.value as CacheEntry;
          if (Date.now() - entry.timestamp >= this.CACHE_DURATION) {
            console.log('Cleaning up expired cache entry:', entry.url);
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            console.log(`Cleaned up ${deletedCount} expired cache entries`);
          }
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  private async getFromDB(url: string): Promise<Blob | null> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(url);
      
      request.onsuccess = () => {
        const result = request.result as CacheEntry | undefined;
        if (result && Date.now() - result.timestamp < this.CACHE_DURATION) {
          resolve(result.blob);
        } else {
          // If expired, delete it immediately
          if (result) {
            this.deleteFromDB(url);
          }
          resolve(null);
        }
      };
      
      request.onerror = () => resolve(null);
    });
  }

  private async deleteFromDB(url: string): Promise<void> {
    if (!this.db) return;
    
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    store.delete(url);
  }

  private async saveToDB(url: string, blob: Blob): Promise<void> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const entry: CacheEntry = {
        url,
        blob,
        timestamp: Date.now()
      };
      
      store.put(entry);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve(); // Don't fail if DB save fails
    });
  }

  async preloadImage(url: string): Promise<string> {
    
    // Check memory cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    // Check IndexedDB
    const cachedBlob = await this.getFromDB(url);
    if (cachedBlob) {
      const objectURL = URL.createObjectURL(cachedBlob);
      this.cache.set(url, objectURL);
      return objectURL;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      
      // Save to both memory and IndexedDB
      this.cache.set(url, objectURL);
      await this.saveToDB(url, blob);
      
      return objectURL;
    } catch (error) {
      throw new Error(`Failed to load image: ${url}`);
    }
  }

  getCachedImageUrl(url: string): string | null {
    return this.cache.get(url) || null;
  }

  isImageCached(url: string): boolean {
    return this.cache.has(url);
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ total: number; size: number }> {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.openCursor();
      
      let total = 0;
      let size = 0;
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          total++;
          const entry = cursor.value as CacheEntry;
          size += entry.blob.size;
          cursor.continue();
        } else {
          resolve({ total, size });
        }
      };
      
      request.onerror = () => resolve({ total: 0, size: 0 });
    });
  }

  // Manual cleanup method
  async manualCleanup(): Promise<void> {
    await this.cleanupExpiredEntries();
  }

  clearCache(): void {
    // Clean up object URLs to prevent memory leaks
    this.cache.forEach(objectURL => {
      URL.revokeObjectURL(objectURL);
    });
    this.cache.clear();
    
    // Clear IndexedDB
    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      transaction.objectStore(this.storeName).clear();
    }
  }
}

export const imageCache = new SimpleImageCache();