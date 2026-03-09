// GCP Cloud Storage operations for 3D models
import * as ModelStorageSchema from './model_storage_schema.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory metadata storage (replace with MongoDB in production)
const modelMetadataStore: Map<string, ModelStorageSchema.IModelMetadata> = new Map();

// In-memory model file storage (stores the actual GLB/GLTF files)
const modelFileStore: Map<string, Buffer> = new Map();

export async function uploadModel(
  userId: string,
  jobId: string,
  modelFile: Buffer,
  fileName: string
): Promise<ModelStorageSchema.IUploadModelResponse> {
  const modelId = uuidv4();
  const gcpPath = `${userId}/${modelId}.glb`;
  
  // Store model file in memory instead of uploading to GCP
  modelFileStore.set(modelId, modelFile);
  console.log('Model file stored in memory:', modelId, 'size:', modelFile.length, 'bytes');
  
  // Generate proxy URL instead of direct GCP URL to avoid CORS issues
  // Format: /api/models/{userId}/{filename}
  const filename = `${modelId}.glb`;
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const signedUrl = `${apiBaseUrl}/api/models/${userId}/${filename}`;
  
  // Store metadata
  const metadata: ModelStorageSchema.IModelMetadata = {
    modelId,
    userId,
    jobId,
    gcpPath,
    fileSize: modelFile.length,
    createdAt: new Date()
  };
  
  modelMetadataStore.set(modelId, metadata);
  
  return {
    modelId,
    gcpPath,
    fileSize: modelFile.length,
    signedUrl
  };
}

export async function getModel(
  modelId: string,
  userId: string
): Promise<ModelStorageSchema.IGetModelResponse> {
  const metadata = modelMetadataStore.get(modelId);
  
  if (!metadata) {
    throw new Error(`Model not found: ${modelId}`);
  }
  
  if (metadata.userId !== userId) {
    throw new Error('Unauthorized access to model');
  }
  
  // Generate proxy URL instead of direct GCP URL to avoid CORS issues
  // Format: /api/models/{userId}/{filename}
  const filename = metadata.gcpPath.split('/').pop() || `${modelId}.glb`;
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
  const signedUrl = `${apiBaseUrl}/api/models/${userId}/${filename}`;
  
  return {
    modelId,
    signedUrl,
    expiresAt: new Date(Date.now() + 3600000), // 1 hour
    metadata
  };
}

export async function getModelFile(modelId: string): Promise<Buffer | null> {
  return modelFileStore.get(modelId) || null;
}

export async function deleteModel(modelId: string, userId: string): Promise<void> {
  const metadata = modelMetadataStore.get(modelId);
  
  if (!metadata) {
    throw new Error(`Model not found: ${modelId}`);
  }
  
  if (metadata.userId !== userId) {
    throw new Error('Unauthorized access to model');
  }
  
  // Delete from memory stores
  modelMetadataStore.delete(modelId);
  modelFileStore.delete(modelId);
}

export type {
  IUploadModelRequest,
  IUploadModelResponse,
  IGetModelRequest,
  IGetModelResponse,
  IModelMetadata
} from './model_storage_schema.js';
