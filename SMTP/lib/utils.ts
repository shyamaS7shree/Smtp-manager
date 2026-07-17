import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Global cache for API rate limiting
interface CacheEntry {
  data: any;
  timestamp: number;
  promise?: Promise<any>;
}

const apiCache = new Map<string, CacheEntry>();

/**
 * Rate-limited API fetch function that prevents multiple calls to the same endpoint within a time window
 * @param url - The API endpoint URL
 * @param options - Fetch options
 * @param cacheKey - Unique key for caching (defaults to URL)
 * @param cacheTimeMs - Cache time in milliseconds (default: 60000 = 60 seconds)
 * @returns Promise with cached or fresh data
 */
export async function rateLimitedFetch(
  url: string,
  options: RequestInit = {},
  cacheKey?: string,
  cacheTimeMs: number = 60000
): Promise<any> {
  const key = cacheKey || url;
  const now = Date.now();
  const cached = apiCache.get(key);

  // If we have a cached result that's still valid, return it
  if (cached && (now - cached.timestamp) < cacheTimeMs) {
    console.log(`🔄 Using cached data for: ${key}`);
    return cached.data;
  }

  // If there's already a pending request for this key, return its promise
  if (cached?.promise) {
    console.log(`⏳ Waiting for pending request: ${key}`);
    return cached.promise;
  }

  // Create a new request
  console.log(`📡 Making fresh API call: ${key}`);
  const promise = fetch(url, options)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      // Cache the successful result
      apiCache.set(key, {
        data,
        timestamp: now,
      });
      return data;
    })
    .catch((error) => {
      // Remove failed requests from cache so they can be retried
      apiCache.delete(key);
      throw error;
    });

  // Store the pending promise to prevent duplicate requests
  apiCache.set(key, {
    data: null,
    timestamp: now,
    promise,
  });

  return promise;
}

/**
 * Clear API cache for a specific key or all keys
 * @param cacheKey - Specific key to clear, or undefined to clear all
 */
export function clearApiCache(cacheKey?: string): void {
  if (cacheKey) {
    apiCache.delete(cacheKey);
    console.log(`🗑️ Cleared cache for: ${cacheKey}`);
  } else {
    apiCache.clear();
    console.log(`🗑️ Cleared all API cache`);
  }
}
