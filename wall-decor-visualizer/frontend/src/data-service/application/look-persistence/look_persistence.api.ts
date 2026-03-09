// API service for look persistence
import type { ILook, IAppliedModel, IBOMItem } from '../../domain/create-look/create_look_schema.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export interface ISaveLookRequest {
  name: string;
  description: string;
  baseModelId: string;
  appliedModels: IAppliedModel[];
  billOfMaterials: IBOMItem[];
  thumbnailDataUrl: string;
}

export interface ISaveLookResponse {
  success: boolean;
  look?: {
    id: string;
    name: string;
    description: string;
    baseModelId: string;
    thumbnailUrl: string;
    version: number;
    createdAt: string;
    updatedAt: string;
  };
  error?: string;
}

export interface IUpdateLookRequest {
  name?: string;
  description?: string;
  appliedModels?: IAppliedModel[];
  billOfMaterials?: IBOMItem[];
  thumbnailDataUrl?: string;
}

export interface IGetLookResponse {
  success: boolean;
  look?: ILook;
  error?: string;
}

export interface IListLooksResponse {
  success: boolean;
  looks?: Array<{
    id: string;
    name: string;
    description: string;
    baseModelId: string;
    thumbnailUrl: string;
    version: number;
    appliedModelsCount: number;
    createdAt: string;
    updatedAt: string;
  }>;
  error?: string;
}

export interface IGenerateShareLinkResponse {
  success: boolean;
  shareLink?: string;
  shareUrl?: string;
  error?: string;
}

/**
 * Save a new look
 */
export async function saveLook(request: ISaveLookRequest): Promise<ISaveLookResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/looks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save look');
    }
    
    return data;
  } catch (error) {
    console.error('Save look error:', error);
    
    // Fallback: Save to localStorage as backup
    try {
      const backupKey = `look_backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(request));
      console.log('Look saved to localStorage backup:', backupKey);
    } catch (storageError) {
      console.error('Failed to save backup to localStorage:', storageError);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save look'
    };
  }
}

/**
 * Update an existing look
 */
export async function updateLook(lookId: string, request: IUpdateLookRequest): Promise<ISaveLookResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/looks/${lookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update look');
    }
    
    return data;
  } catch (error) {
    console.error('Update look error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update look'
    };
  }
}

/**
 * Get a specific look by ID
 */
export async function getLook(lookId: string): Promise<IGetLookResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/looks/${lookId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get look');
    }
    
    return data;
  } catch (error) {
    console.error('Get look error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get look'
    };
  }
}

/**
 * List all looks for the current user
 */
export async function listLooks(): Promise<IListLooksResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/looks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to list looks');
    }
    
    return data;
  } catch (error) {
    console.error('List looks error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list looks'
    };
  }
}

/**
 * Delete a look
 */
export async function deleteLook(lookId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/looks/${lookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete look');
    }
    
    return data;
  } catch (error) {
    console.error('Delete look error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete look'
    };
  }
}

/**
 * Generate a share link for a look
 */
export async function generateShareLink(lookId: string): Promise<IGenerateShareLinkResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/looks/${lookId}/share`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate share link');
    }
    
    return data;
  } catch (error) {
    console.error('Generate share link error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate share link'
    };
  }
}

/**
 * Get a shared look (no authentication required)
 */
export async function getSharedLook(shareLink: string): Promise<IGetLookResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/shared-looks/${shareLink}`, {
      method: 'GET'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get shared look');
    }
    
    return data;
  } catch (error) {
    console.error('Get shared look error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get shared look'
    };
  }
}

/**
 * Capture a screenshot from a Three.js renderer for thumbnail
 */
export function captureViewerScreenshot(renderer: any): string {
  if (!renderer || !renderer.domElement) {
    throw new Error('Invalid renderer');
  }
  
  const canvas = renderer.domElement;
  return canvas.toDataURL('image/png');
}
