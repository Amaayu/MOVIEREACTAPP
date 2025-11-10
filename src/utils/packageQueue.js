/**
 * Package download queue manager
 * Manages concurrent downloads with retry logic and backoff
 */

const MAX_CONCURRENT_DOWNLOADS = 8;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

class PackageQueue {
  constructor() {
    this.queue = [];
    this.active = 0;
    this.retryMap = new Map(); // Track retry counts
  }

  /**
   * Add package download to queue
   * @param {Function} downloadFn - Async function that performs the download
   * @param {string} key - Unique key for this download
   * @returns {Promise}
   */
  async add(downloadFn, key) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        downloadFn,
        key,
        resolve,
        reject,
        retries: this.retryMap.get(key) || 0
      });

      this.process();
    });
  }

  /**
   * Process queue
   */
  async process() {
    if (this.active >= MAX_CONCURRENT_DOWNLOADS || this.queue.length === 0) {
      return;
    }

    this.active++;
    const item = this.queue.shift();

    try {
      const result = await item.downloadFn();
      
      // Success - clear retry count
      this.retryMap.delete(item.key);
      item.resolve(result);
    } catch (error) {
      // Handle retry logic
      if (item.retries < MAX_RETRIES) {
        const retryCount = item.retries + 1;
        this.retryMap.set(item.key, retryCount);

        // Exponential backoff
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, item.retries);
        
        console.warn(`Retrying ${item.key} (attempt ${retryCount}/${MAX_RETRIES}) after ${delay}ms`);

        setTimeout(() => {
          this.queue.unshift({
            ...item,
            retries: retryCount
          });
          this.process();
        }, delay);

        item.resolve(null); // Resolve with null for now, will retry
      } else {
        // Max retries exceeded
        console.error(`Failed to download ${item.key} after ${MAX_RETRIES} retries`);
        this.retryMap.delete(item.key);
        item.reject(error);
      }
    } finally {
      this.active--;
      this.process(); // Process next item
    }
  }

  /**
   * Get queue status
   * @returns {Object}
   */
  getStatus() {
    return {
      active: this.active,
      queued: this.queue.length,
      total: this.active + this.queue.length
    };
  }

  /**
   * Clear queue
   */
  clear() {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'));
    });
    this.queue = [];
    this.retryMap.clear();
  }
}

// Singleton instance
const packageQueue = new PackageQueue();

export default packageQueue;
