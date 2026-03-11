// API call for fetching catalog models
import type { ICatalogItem } from '../../domain/create-look/create_look_schema.js';
import { CatalogLoadError } from '../errors.js';
import { logAPICall, logAPIResponse, logAPIError } from '../../../logger.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ICatalogModelsResponse {
  success: boolean;
  data?: {
    models: Array<{
      fileName: string;
      filePath: string;
      extension: string;
      metadata?: {
        modelId: string;
        dimensions: {
          width: number;
          height: number;
          depth: number;
        };
      };
      parseError?: string;
    }>;
    count: number;
  };
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Fetches catalog models from the backend API
 * Transforms backend response into ICatalogItem format
 */
export async function getCatalogModelsApi(): Promise<ICatalogItem[]> {
  const apiName = '/api/catalog/models';
  const method = 'GET';
  const startTime = logAPICall({ apiName, method });
  
  try {
    const response = await fetch(`${API_BASE_URL}${apiName}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new CatalogLoadError(`Catalog fetch failed with status ${response.status}`);
    }
    
    const data: ICatalogModelsResponse = await response.json();
    
    const duration = Date.now() - startTime;
    logAPIResponse({ apiName, method, status: response.status, duration, response: data });
    
    if (!data.success || !data.data) {
      throw new CatalogLoadError(data.error?.message || 'Failed to load catalog');
    }
    
    // Transform backend response to ICatalogItem format
    const catalogItems: ICatalogItem[] = data.data.models
      .filter(model => model.metadata) // Only include successfully parsed models
      .map(model => {
        const metadata = model.metadata!;
        const now = new Date().toISOString();
        
        return {
          id: metadata.modelId,
          name: generateNameFromId(metadata.modelId),
          description: `${metadata.modelId} - ${metadata.dimensions.width}' x ${metadata.dimensions.height}' x ${metadata.dimensions.depth}'`,
          category: inferCategory(metadata.modelId),
          dimensions: {
            width: metadata.dimensions.width,
            height: metadata.dimensions.height,
            depth: metadata.dimensions.depth
          },
          thumbnailUrl: generateThumbnailUrl(metadata.modelId),
          modelUrl: `/models/${model.fileName}`,
          filePath: model.filePath,
          tags: generateTags(metadata.modelId),
          createdAt: now,
          updatedAt: now
        };
      });
    
    return catalogItems;
  } catch (error) {
    logAPIError({ apiName, method, error });
    if (error instanceof CatalogLoadError) {
      throw error;
    }
    throw new CatalogLoadError(
      `Failed to fetch catalog: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

function getAuthToken(): string {
  // Get auth token from storage
  return localStorage.getItem('authToken') || '';
}

/**
 * Generates a human-readable name from model ID
 */
function generateNameFromId(modelId: string): string {
  // Convert underscores to spaces and capitalize words
  return modelId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Infers category from model ID
 * This is a simple heuristic - can be improved with metadata
 */
function inferCategory(modelId: string): 'panels' | 'lights' | 'cove' | 'bidding' | 'artwork' | 'shelf' {
  const id = modelId.toLowerCase();
  
  if (id.includes('light') || id.includes('lamp')) {
    return 'lights';
  }
  if (id.includes('panel') || id.includes('wx') || id.includes('h2022')) {
    return 'panels';
  }
  if (id.includes('cove')) {
    return 'cove';
  }
  if (id.includes('bidding') || id.includes('trim')) {
    return 'bidding';
  }
  if (id.includes('art') || id.includes('frame')) {
    return 'artwork';
  }
  if (id.includes('shelve') || id.includes('shelf')) {
    return 'shelf';
  }
  
  return 'shelf';
}

/**
 * Generates thumbnail URL for model
 * For now, returns a placeholder - can be enhanced to check for actual thumbnails
 */
function generateThumbnailUrl(modelId: string): string {
  // Check if thumbnail exists, otherwise use placeholder
  return `/models/${modelId}_thumb.png`;
}

/**
 * Generates tags from model ID
 */
function generateTags(modelId: string): string[] {
  const tags: string[] = [];
  const id = modelId.toLowerCase();
  
  // Add category-based tags
  if (id.includes('light')) tags.push('lighting');
  if (id.includes('panel')) tags.push('wall panel');
  if (id.includes('shelve') || id.includes('shelf')) tags.push('storage', 'shelving');
  if (id.includes('tv')) tags.push('entertainment', 'media');
  if (id.includes('floating')) tags.push('floating', 'modern');
  if (id.includes('walnut')) tags.push('wood', 'walnut');
  if (id.includes('cubik')) tags.push('cubic', 'geometric');
  
  // Add model ID as tag
  tags.push(modelId);
  
  return tags;
}


// Re-export with alias for backward compatibility
export { getCatalogModelsApi as getCatalogModels };
