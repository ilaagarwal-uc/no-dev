/**
 * File Validation Utilities for Catalog Models
 * Validates filename format, file extension, and file size
 */

import path from 'path';
import { parseFilenameMetadata } from './index.js';

export interface IFileValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
}

/**
 * Validates filename format: {MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb
 * @param fileName - The filename to validate
 * @returns Validation result
 */
export function validateFilenameFormat(fileName: string): IFileValidationResult {
  const parseResult = parseFilenameMetadata(fileName);
  
  if (!parseResult.success || !parseResult.metadata) {
    return {
      valid: false,
      error: parseResult.error || 'Invalid filename format',
      code: 'INVALID_FILENAME_FORMAT'
    };
  }
  
  return { valid: true };
}

/**
 * Validates file extension (.glb or .gltf only)
 * @param fileName - The filename to validate
 * @returns Validation result
 */
export function validateFileExtension(fileName: string): IFileValidationResult {
  const ext = path.extname(fileName).toLowerCase();
  
  if (ext !== '.glb' && ext !== '.gltf') {
    return {
      valid: false,
      error: 'File extension must be .glb or .gltf',
      code: 'INVALID_FILE_EXTENSION'
    };
  }
  
  return { valid: true };
}

/**
 * Validates file size (< 50MB)
 * @param fileSizeBytes - File size in bytes
 * @returns Validation result
 */
export function validateFileSize(fileSizeBytes: number): IFileValidationResult {
  const MAX_FILE_SIZE_MB = 50;
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  
  if (fileSizeMB > MAX_FILE_SIZE_MB) {
    return {
      valid: false,
      error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds ${MAX_FILE_SIZE_MB}MB limit`,
      code: 'FILE_TOO_LARGE'
    };
  }
  
  return { valid: true };
}

/**
 * Validates all file requirements
 * @param fileName - The filename to validate
 * @param fileSizeBytes - File size in bytes
 * @returns Validation result
 */
export function validateCatalogFile(fileName: string, fileSizeBytes: number): IFileValidationResult {
  // Validate filename format
  const formatResult = validateFilenameFormat(fileName);
  if (!formatResult.valid) {
    return formatResult;
  }
  
  // Validate file extension
  const extensionResult = validateFileExtension(fileName);
  if (!extensionResult.valid) {
    return extensionResult;
  }
  
  // Validate file size
  const sizeResult = validateFileSize(fileSizeBytes);
  if (!sizeResult.valid) {
    return sizeResult;
  }
  
  return { valid: true };
}
