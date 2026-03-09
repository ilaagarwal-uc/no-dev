// Catalog service with caching
import type { ICatalogItem } from '../../domain/create-look/create_look_schema.js';
import { getCatalogModelsApi } from './get_catalog_models.api.js';

/**
 * Catalog service that manages loading and caching of catalog items
 */
class CatalogService {
  private cache: ICatalogItem[] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
  private loadingPromise: Promise<ICatalogItem[]> | null = null;

  /**
   * Loads catalog items from API or cache
   * @param forceRefresh - If true, bypasses cache and fetches fresh data
   * @returns Array of catalog items
   */
  async loadCatalog(forceRefresh: boolean = false): Promise<ICatalogItem[]> {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.isCacheValid()) {
      console.log('Returning cached catalog items');
      return this.cache!;
    }

    // If already loading, return the existing promise
    if (this.loadingPromise) {
      console.log('Catalog load already in progress, waiting...');
      return this.loadingPromise;
    }

    // Start new load
    console.log('Loading catalog from API...');
    this.loadingPromise = this.fetchAndCache();

    try {
      const items = await this.loadingPromise;
      return items;
    } finally {
      this.loadingPromise = null;
    }
  }

  /**
   * Fetches catalog from API and updates cache
   */
  private async fetchAndCache(): Promise<ICatalogItem[]> {
    const items = await getCatalogModelsApi();
    
    // Update cache
    this.cache = items;
    this.cacheTimestamp = Date.now();
    
    console.log(`Cached ${items.length} catalog items`);
    return items;
  }

  /**
   * Checks if cache is valid
   */
  private isCacheValid(): boolean {
    if (!this.cache || !this.cacheTimestamp) {
      return false;
    }

    const age = Date.now() - this.cacheTimestamp;
    return age < this.CACHE_DURATION_MS;
  }

  /**
   * Gets a specific catalog item by ID
   * @param itemId - The catalog item ID
   * @returns The catalog item or undefined if not found
   */
  async getCatalogItem(itemId: string): Promise<ICatalogItem | undefined> {
    const items = await this.loadCatalog();
    return items.find(item => item.id === itemId);
  }

  /**
   * Filters catalog items by category
   * @param category - The category to filter by
   * @returns Filtered catalog items
   */
  async getCatalogByCategory(category: string): Promise<ICatalogItem[]> {
    const items = await this.loadCatalog();
    return items.filter(item => item.category === category);
  }

  /**
   * Searches catalog items by name or tags
   * @param query - The search query
   * @returns Matching catalog items
   */
  async searchCatalog(query: string): Promise<ICatalogItem[]> {
    const items = await this.loadCatalog();
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => {
      // Search in name
      if (item.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search in tags
      if (item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }
      
      // Search in ID
      if (item.id.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      return false;
    });
  }

  /**
   * Clears the cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = null;
    console.log('Catalog cache cleared');
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { isCached: boolean; itemCount: number; ageMs: number | null } {
    return {
      isCached: this.cache !== null,
      itemCount: this.cache?.length || 0,
      ageMs: this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null
    };
  }
}

// Export singleton instance
export const catalogService = new CatalogService();
