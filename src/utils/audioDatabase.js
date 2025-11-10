import { openDB } from 'idb';

const DB_NAME = 'MovieHubAudioCache';
const DB_VERSION = 1;
const PACKAGE_STORE = 'packages';
const MANIFEST_STORE = 'manifests';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Initialize IndexedDB
 */
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create packages store
      if (!db.objectStoreNames.contains(PACKAGE_STORE)) {
        const packageStore = db.createObjectStore(PACKAGE_STORE, { keyPath: 'key' });
        packageStore.createIndex('trackId', 'trackId');
        packageStore.createIndex('timestamp', 'timestamp');
      }

      // Create manifests store
      if (!db.objectStoreNames.contains(MANIFEST_STORE)) {
        db.createObjectStore(MANIFEST_STORE, { keyPath: 'id' });
      }
    },
  });
}

/**
 * Save audio package to IndexedDB
 * @param {string} trackId - Track ID
 * @param {number} packageIndex - Package index
 * @param {ArrayBuffer} data - Audio data
 */
export async function savePackage(trackId, packageIndex, data) {
  try {
    const db = await initDB();
    const key = `${trackId}-${packageIndex}`;
    
    await db.put(PACKAGE_STORE, {
      key,
      trackId,
      packageIndex,
      data,
      timestamp: Date.now(),
      size: data.byteLength
    });

    // Check and enforce cache size limit
    await enforceCacheLimit(db);
  } catch (error) {
    console.error('Error saving package:', error);
  }
}

/**
 * Get audio package from IndexedDB
 * @param {string} trackId - Track ID
 * @param {number} packageIndex - Package index
 * @returns {Promise<ArrayBuffer|null>}
 */
export async function getPackage(trackId, packageIndex) {
  try {
    const db = await initDB();
    const key = `${trackId}-${packageIndex}`;
    const record = await db.get(PACKAGE_STORE, key);
    
    if (record) {
      // Update timestamp for LRU
      record.timestamp = Date.now();
      await db.put(PACKAGE_STORE, record);
      return record.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting package:', error);
    return null;
  }
}

/**
 * Save track manifest to IndexedDB
 * @param {Object} manifest - Track manifest
 */
export async function saveManifest(manifest) {
  try {
    const db = await initDB();
    await db.put(MANIFEST_STORE, {
      ...manifest,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error saving manifest:', error);
  }
}

/**
 * Get track manifest from IndexedDB
 * @param {string} trackId - Track ID
 * @returns {Promise<Object|null>}
 */
export async function getManifest(trackId) {
  try {
    const db = await initDB();
    return await db.get(MANIFEST_STORE, trackId);
  } catch (error) {
    console.error('Error getting manifest:', error);
    return null;
  }
}

/**
 * Get all packages for a track
 * @param {string} trackId - Track ID
 * @returns {Promise<Array>}
 */
export async function getTrackPackages(trackId) {
  try {
    const db = await initDB();
    const tx = db.transaction(PACKAGE_STORE, 'readonly');
    const index = tx.store.index('trackId');
    return await index.getAll(trackId);
  } catch (error) {
    console.error('Error getting track packages:', error);
    return [];
  }
}

/**
 * Delete packages for a track
 * @param {string} trackId - Track ID
 */
export async function deleteTrackPackages(trackId) {
  try {
    const db = await initDB();
    const tx = db.transaction(PACKAGE_STORE, 'readwrite');
    const index = tx.store.index('trackId');
    const keys = await index.getAllKeys(trackId);
    
    for (const key of keys) {
      await tx.store.delete(key);
    }
    
    await tx.done;
  } catch (error) {
    console.error('Error deleting track packages:', error);
  }
}

/**
 * Get total cache size
 * @returns {Promise<number>}
 */
export async function getCacheSize() {
  try {
    const db = await initDB();
    const packages = await db.getAll(PACKAGE_STORE);
    return packages.reduce((total, pkg) => total + (pkg.size || 0), 0);
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
}

/**
 * Enforce cache size limit using LRU strategy
 * @param {IDBDatabase} db - Database instance
 */
async function enforceCacheLimit(db) {
  try {
    const packages = await db.getAll(PACKAGE_STORE);
    const totalSize = packages.reduce((sum, pkg) => sum + (pkg.size || 0), 0);

    if (totalSize > MAX_CACHE_SIZE) {
      // Sort by timestamp (oldest first)
      packages.sort((a, b) => a.timestamp - b.timestamp);

      let sizeToRemove = totalSize - MAX_CACHE_SIZE;
      const tx = db.transaction(PACKAGE_STORE, 'readwrite');

      for (const pkg of packages) {
        if (sizeToRemove <= 0) break;
        
        await tx.store.delete(pkg.key);
        sizeToRemove -= pkg.size || 0;
      }

      await tx.done;
    }
  } catch (error) {
    console.error('Error enforcing cache limit:', error);
  }
}

/**
 * Clear all cached data
 */
export async function clearCache() {
  try {
    const db = await initDB();
    await db.clear(PACKAGE_STORE);
    await db.clear(MANIFEST_STORE);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache statistics
 * @returns {Promise<Object>}
 */
export async function getCacheStats() {
  try {
    const db = await initDB();
    const packages = await db.getAll(PACKAGE_STORE);
    const manifests = await db.getAll(MANIFEST_STORE);
    
    const totalSize = packages.reduce((sum, pkg) => sum + (pkg.size || 0), 0);
    const trackIds = [...new Set(packages.map(pkg => pkg.trackId))];

    return {
      packageCount: packages.length,
      manifestCount: manifests.length,
      totalSize,
      trackCount: trackIds.length,
      maxSize: MAX_CACHE_SIZE,
      usagePercent: (totalSize / MAX_CACHE_SIZE) * 100
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return {
      packageCount: 0,
      manifestCount: 0,
      totalSize: 0,
      trackCount: 0,
      maxSize: MAX_CACHE_SIZE,
      usagePercent: 0
    };
  }
}
