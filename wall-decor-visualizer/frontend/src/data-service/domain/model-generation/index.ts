// Domain logic for frontend model generation
import * as ModelGenerationSchema from './model_generation_schema.js';

export function validateGenerateRequest(
  request: ModelGenerationSchema.IGenerateModelRequest
): boolean {
  return (
    !!request.userId &&
    !!request.imageId &&
    !!request.imageUrl &&
    !!request.dimensionData &&
    (Array.isArray(request.dimensionData.elements) || request.dimensionData.elements === undefined)
  );
}

export function isJobComplete(status: string): boolean {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type {
  IGenerateModelRequest,
  IGenerateModelResponse,
  IDimensionData,
  IElement,
  IJobStatusResponse,
  IJobStatus,
  IModelResponse,
  IModel,
  IModelMetadata
} from './model_generation_schema.js';
