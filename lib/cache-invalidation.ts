// Cache invalidation utilities
// These functions help manage when cache should be cleared

import { 
  invalidateCategoryCache, 
  invalidateStoreCache, 
  invalidateAllCache,
  getCacheStats 
} from './product-cache';

// Cache invalidation reasons
export enum CacheInvalidationReason {
  USER_ACTION = 'user_action',
  DATA_UPDATE = 'data_update',
  TIME_EXPIRED = 'time_expired',
  MANUAL_CLEAR = 'manual_clear',
  ERROR_RECOVERY = 'error_recovery'
}

// Cache invalidation manager
class CacheInvalidationManager {
  private invalidationCallbacks: Array<(reason: CacheInvalidationReason) => void> = [];

  // Register callback for cache invalidation events
  onInvalidation(callback: (reason: CacheInvalidationReason) => void) {
    this.invalidationCallbacks.push(callback);
  }

  // Remove callback
  offInvalidation(callback: (reason: CacheInvalidationReason) => void) {
    const index = this.invalidationCallbacks.indexOf(callback);
    if (index > -1) {
      this.invalidationCallbacks.splice(index, 1);
    }
  }

  // Notify all callbacks
  private notify(reason: CacheInvalidationReason) {
    this.invalidationCallbacks.forEach(callback => {
      try {
        callback(reason);
      } catch (error) {
        console.error('Cache invalidation callback error:', error);
      }
    });
  }

  // Invalidate cache for specific category
  invalidateCategory(categoryId: number, reason: CacheInvalidationReason = CacheInvalidationReason.DATA_UPDATE) {
    console.log(`🔄 Cache invalidation: Category ${categoryId} (${reason})`);
    invalidateCategoryCache(categoryId);
    this.notify(reason);
  }

  // Invalidate cache for specific store
  invalidateStore(storeId: number, reason: CacheInvalidationReason = CacheInvalidationReason.DATA_UPDATE) {
    console.log(`🔄 Cache invalidation: Store ${storeId} (${reason})`);
    invalidateStoreCache(storeId);
    this.notify(reason);
  }

  // Invalidate all cache
  invalidateAll(reason: CacheInvalidationReason = CacheInvalidationReason.MANUAL_CLEAR) {
    console.log(`🔄 Cache invalidation: All cache (${reason})`);
    invalidateAllCache();
    this.notify(reason);
  }

  // Smart invalidation based on data changes
  invalidateByDataChange(dataType: 'product' | 'category' | 'store' | 'pricing', dataId?: number) {
    switch (dataType) {
      case 'product':
        // Product changes might affect multiple categories and stores
        this.invalidateAll(CacheInvalidationReason.DATA_UPDATE);
        break;
      case 'category':
        if (dataId) {
          this.invalidateCategory(dataId, CacheInvalidationReason.DATA_UPDATE);
        } else {
          this.invalidateAll(CacheInvalidationReason.DATA_UPDATE);
        }
        break;
      case 'store':
        if (dataId) {
          this.invalidateStore(dataId, CacheInvalidationReason.DATA_UPDATE);
        } else {
          this.invalidateAll(CacheInvalidationReason.DATA_UPDATE);
        }
        break;
      case 'pricing':
        // Pricing changes affect all products
        this.invalidateAll(CacheInvalidationReason.DATA_UPDATE);
        break;
    }
  }

  // Check if cache needs invalidation based on time
  checkTimeBasedInvalidation() {
    const stats = getCacheStats();
    if (stats.size === 0) return;

    // This would be implemented based on your cache expiration logic
    // For now, we'll just log the check
    console.log(`🕐 Cache time check: ${stats.size} entries`);
  }

  // Get invalidation statistics
  getStats() {
    return {
      callbacks: this.invalidationCallbacks.length,
      cacheStats: getCacheStats()
    };
  }
}

// Create singleton instance
export const cacheInvalidationManager = new CacheInvalidationManager();

// Convenience functions
export const invalidateCategory = (categoryId: number, reason?: CacheInvalidationReason) => {
  cacheInvalidationManager.invalidateCategory(categoryId, reason);
};

export const invalidateStore = (storeId: number, reason?: CacheInvalidationReason) => {
  cacheInvalidationManager.invalidateStore(storeId, reason);
};

export const invalidateAll = (reason?: CacheInvalidationReason) => {
  cacheInvalidationManager.invalidateAll(reason);
};

export const invalidateByDataChange = (dataType: 'product' | 'category' | 'store' | 'pricing', dataId?: number) => {
  cacheInvalidationManager.invalidateByDataChange(dataType, dataId);
};

// Auto-invalidation on certain events
if (typeof window !== 'undefined') {
  // Invalidate cache on page visibility change (user comes back to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      console.log('👁️ Page became visible - checking cache validity');
      cacheInvalidationManager.checkTimeBasedInvalidation();
    }
  });

  // Invalidate cache on storage change (if another tab modified cache)
  window.addEventListener('storage', (event) => {
    if (event.key === 'product-cache') {
      console.log('🔄 Cache modified in another tab - refreshing');
      cacheInvalidationManager.invalidateAll(CacheInvalidationReason.DATA_UPDATE);
    }
  });

  // Invalidate cache on beforeunload (optional - for cleanup)
  window.addEventListener('beforeunload', () => {
    // Only clear if there are too many entries (cleanup)
    const stats = getCacheStats();
    if (stats.size > 20) {
      console.log('🧹 Cleaning up cache before page unload');
      cacheInvalidationManager.invalidateAll(CacheInvalidationReason.USER_ACTION);
    }
  });
}

export default cacheInvalidationManager;
