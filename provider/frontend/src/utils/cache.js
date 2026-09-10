/**
 * Simple in-memory cache for API responses to reduce latency and redundant network calls.
 */
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 15 * 60 * 1000; // 15 minutes default TTL
  }

  set(key, data, ttl = this.ttl) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { data, expiresAt });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

export const apiCache = new ApiCache();
