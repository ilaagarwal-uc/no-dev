import fs from 'fs/promises';
import path from 'path';

export interface ICatalogFile {
  fileName: string;
  filePath: string;
  extension: string;
  metadata?: IParsedCatalogMetadata;
  parseError?: string;
}

export interface IParsedCatalogMetadata {
  modelId: string;
  dimensions: {
    width: number;  // In feet
    height: number; // In feet
    depth: number;  // In feet
  };
}

export interface IParseResult {
  success: boolean;
  metadata?: IParsedCatalogMetadata;
  error?: string;
}

/**
 * Parses filename following format: {MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT.glb
 * Example: WX919_0.658X0.0379X9.5_FT.glb
 * @param fileName - The filename to parse
 * @returns Parse result with metadata or error
 */
export function parseFilenameMetadata(fileName: string): IParseResult {
  try {
    // Remove file extension
    const nameWithoutExt = fileName.replace(/\.(glb|gltf)$/i, '');
    
    // Expected format: {MODEL_ID}_{WIDTH}X{HEIGHT}X{DEPTH}_FT
    // Split by underscore to separate parts
    const parts = nameWithoutExt.split('_');
    
    // Need at least 3 parts: MODEL_ID, DIMENSIONS, FT
    if (parts.length < 3) {
      return {
        success: false,
        error: `Invalid filename format: expected at least 3 parts separated by underscore, got ${parts.length}`
      };
    }
    
    // Last part should be "FT"
    const lastPart = parts[parts.length - 1];
    if (lastPart.toUpperCase() !== 'FT') {
      return {
        success: false,
        error: `Invalid filename format: expected last part to be "FT", got "${lastPart}"`
      };
    }
    
    // Second to last part should be dimensions (WIDTHxHEIGHTxDEPTH)
    const dimensionsPart = parts[parts.length - 2];
    const dimensionValues = dimensionsPart.split('X');
    
    if (dimensionValues.length !== 3) {
      return {
        success: false,
        error: `Invalid dimensions format: expected 3 values separated by "X", got ${dimensionValues.length}`
      };
    }
    
    // Parse dimension values
    const width = parseFloat(dimensionValues[0]);
    const height = parseFloat(dimensionValues[1]);
    const depth = parseFloat(dimensionValues[2]);
    
    // Validate dimensions are positive numbers
    if (isNaN(width) || width <= 0) {
      return {
        success: false,
        error: `Invalid width: must be a positive number, got "${dimensionValues[0]}"`
      };
    }
    
    if (isNaN(height) || height <= 0) {
      return {
        success: false,
        error: `Invalid height: must be a positive number, got "${dimensionValues[1]}"`
      };
    }
    
    if (isNaN(depth) || depth < 0) {
      return {
        success: false,
        error: `Invalid depth: must be a non-negative number, got "${dimensionValues[2]}"`
      };
    }
    
    // Model ID is everything before the dimensions part
    // Join all parts except the last two (dimensions and FT)
    const modelId = parts.slice(0, parts.length - 2).join('_');
    
    if (!modelId) {
      return {
        success: false,
        error: 'Invalid filename format: missing MODEL_ID'
      };
    }
    
    return {
      success: true,
      metadata: {
        modelId,
        dimensions: {
          width,
          height,
          depth
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse filename: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Scans the /models folder for .glb and .gltf files
 * @param modelsPath - Absolute path to the models folder
 * @returns Array of catalog files with metadata
 */
export async function scanModelsFolder(modelsPath: string): Promise<ICatalogFile[]> {
  try {
    // Read directory contents
    const files = await fs.readdir(modelsPath);
    
    // Filter for .glb and .gltf files
    const catalogFiles: ICatalogFile[] = [];
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      
      if (ext === '.glb' || ext === '.gltf') {
        // Parse filename metadata
        const parseResult = parseFilenameMetadata(file);
        
        if (parseResult.success && parseResult.metadata) {
          // Successfully parsed
          catalogFiles.push({
            fileName: file,
            filePath: path.join(modelsPath, file),
            extension: ext,
            metadata: parseResult.metadata
          });
        } else {
          // Parsing failed - log warning and include file with error
          console.warn(`Failed to parse filename "${file}": ${parseResult.error}`);
          catalogFiles.push({
            fileName: file,
            filePath: path.join(modelsPath, file),
            extension: ext,
            parseError: parseResult.error
          });
        }
      }
    }
    
    return catalogFiles;
  } catch (error) {
    console.error('Error scanning models folder:', error);
    throw new Error('Failed to scan models folder');
  }
}
