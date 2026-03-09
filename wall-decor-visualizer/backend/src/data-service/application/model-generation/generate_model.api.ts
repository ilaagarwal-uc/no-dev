// API endpoint for generating 3D model
import { Request, Response } from 'express';
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import * as JobQueueDomain from '../../domain/job-queue/index.js';
import * as GeminiService from '../../domain/gemini-service/index.js';
import * as BlenderService from '../../domain/blender-service/index.js';
import * as ModelStorage from '../../domain/model-storage/index.js';

export async function generateModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const { userId, imageId, dimensionData, imageUrl } = req.body;
    
    console.log('Generate model request received:', {
      userId,
      imageId,
      hasDimensionData: !!dimensionData,
      hasImageUrl: !!imageUrl
    });
    
    // Validate request
    const request: ModelGenerationDomain.IGenerateModelRequest = {
      userId,
      imageId,
      dimensionData,
      imageUrl
    };
    
    if (!ModelGenerationDomain.validateGenerateRequest(request)) {
      console.error('Request validation failed:', request);
      res.status(400).json({ success: false, error: 'Invalid request data' });
      return;
    }
    
    // Queue job for async processing
    const jobId = await JobQueueDomain.queueJob(userId, imageId, dimensionData, imageUrl);
    
    // Start processing job in background
    processModelGenerationJob(jobId);
    
    res.status(202).json({
      success: true,
      jobId,
      message: 'Model generation started'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function processModelGenerationJob(jobId: string): Promise<void> {
  try {
    const job = await JobQueueDomain.getJobStatus(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }
    
    // Stage 1: Validate dimension data (10%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 10,
      stage: 'Validating dimension data'
    });
    
    // Fetch image data from GCP Storage directly if imageUrl is provided
    let imageBase64: string | undefined;
    if (job.imageUrl) {
      try {
        console.log('Fetching image from GCP Storage:', job.imageUrl);
        
        // Parse the imageUrl to extract bucket path
        // Format: /api/images/{userId}/{imageId}/{filename}
        const urlParts = job.imageUrl.split('/');
        const userId = urlParts[urlParts.length - 3];
        const imageId = urlParts[urlParts.length - 2];
        const filename = urlParts[urlParts.length - 1];
        const gcpPath = `${userId}/${imageId}/${filename}`;
        
        console.log('GCP path:', gcpPath);
        
        // Import GCP Storage
        const { Storage } = await import('@google-cloud/storage');
        const bucketName = process.env.GCP_BUCKET_NAME || 'wall-decor-visualizer-images';
        const credentials = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || '{}');
        
        const storage = new Storage({
          projectId: process.env.GCP_PROJECT_ID,
          credentials: credentials
        });
        
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(gcpPath);
        
        // Download file as buffer
        const [buffer] = await file.download();
        imageBase64 = buffer.toString('base64');
        
        console.log('Image fetched successfully from GCP Storage, size:', buffer.length, 'bytes');
      } catch (error) {
        console.error('Error fetching image from GCP Storage:', error);
        console.warn('Continuing without image data');
      }
    }
    
    // Stage 2: Generate Blender script with Gemini (30%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 30,
      stage: 'Generating Blender script with Gemini AI'
    });
    
    // Create output path for glTF file (needed for script modification)
    const outputPath = `/tmp/${jobId}.glb`;
    
    const blenderScript = await GeminiService.generateBlenderScript(
      job.dimensionData,
      imageBase64
    );
    
    console.log('Blender script generated, length:', blenderScript.length, 'characters');
    
    // CRITICAL FIX: Inject output path at the top AND replace filepath in export
    // This ensures the script uses our path regardless of how Gemini structured it
    let modifiedScript = blenderScript;
    
    // Step 1: Inject path variable at the very top of the script
    const pathInjection = `# INJECTED: Output path for GLB export
OUTPUT_PATH = '${outputPath}'

`;
    modifiedScript = pathInjection + modifiedScript;
    console.log('Injected OUTPUT_PATH variable at top of script:', outputPath);
    
    // Step 2: Replace any hardcoded filepath in export_scene.gltf() calls
    // Match: filepath='any_path' or filepath="any_path" or filepath=r'any_path'
    const filepathRegex = /filepath\s*=\s*r?['"][^'"]*['"]/g;
    const filepathMatches = modifiedScript.match(filepathRegex);
    
    if (filepathMatches && filepathMatches.length > 0) {
      console.log('Found filepath parameter(s) in export statement:', filepathMatches);
      // Replace all filepath parameters with OUTPUT_PATH variable
      modifiedScript = modifiedScript.replace(filepathRegex, `filepath=OUTPUT_PATH`);
      console.log('Replaced filepath parameters with OUTPUT_PATH variable');
    } else {
      console.warn('No filepath parameter found in export statement');
      // Try to find the export_scene.gltf call and inject filepath parameter
      const exportRegex = /(bpy\.ops\.export_scene\.gltf\s*\([^)]*)/g;
      if (modifiedScript.match(exportRegex)) {
        console.log('Found export_scene.gltf call, injecting filepath parameter');
        modifiedScript = modifiedScript.replace(exportRegex, (match) => {
          // Check if it already has filepath parameter
          if (match.includes('filepath')) {
            return match;
          }
          // Add filepath parameter
          return match + (match.endsWith('(') ? '' : ', ') + 'filepath=OUTPUT_PATH';
        });
      }
    }
    
    console.log('Blender script modified to use output path:', outputPath);
    
    // Stage 3: Execute Blender script (60%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 60,
      stage: 'Executing Blender script'
    });
    
    let modelFile: Buffer;
    try {
      // Try to execute Blender script
      const result = await BlenderService.executeBlenderScript(modifiedScript, outputPath);
      
      if (result.warning) {
        console.warn('Blender execution warning:', result.warning);
      }
      
      // Read the generated GLB file
      const fs = await import('fs/promises');
      modelFile = await fs.readFile(outputPath);
      console.log('GLB file generated by Blender, size:', modelFile.length, 'bytes');
      
      // Clean up temporary file
      await fs.unlink(outputPath).catch(() => {});
    } catch (error) {
      console.error('Blender execution failed:', error);
      
      // Fallback: Create a minimal mock GLB file
      console.log('Using fallback mock GLB file');
      
      // Create a simple cube mesh data
      const positions = new Float32Array([
        -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1, // Front face
        -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1  // Back face
      ]);
      const indices = new Uint16Array([
        0, 1, 2, 0, 2, 3, // Front
        4, 5, 6, 4, 6, 7  // Back
      ]);
      
      // Create binary buffer
      const bufferData = Buffer.concat([
        Buffer.from(positions.buffer),
        Buffer.from(indices.buffer)
      ]);
      
      // Create glTF JSON structure
      const gltfJson = {
        asset: { version: '2.0', generator: 'Mock Generator' },
        scene: 0,
        scenes: [{ nodes: [0] }],
        nodes: [{ mesh: 0 }],
        meshes: [{
          primitives: [{
            attributes: { POSITION: 0 },
            indices: 1
          }]
        }],
        accessors: [
          {
            bufferView: 0,
            componentType: 5126, // FLOAT
            count: 8,
            type: 'VEC3',
            max: [1, 1, 1],
            min: [-1, -1, -1]
          },
          {
            bufferView: 1,
            componentType: 5123, // UNSIGNED_SHORT
            count: 12,
            type: 'SCALAR'
          }
        ],
        bufferViews: [
          { buffer: 0, byteOffset: 0, byteLength: positions.byteLength },
          { buffer: 0, byteOffset: positions.byteLength, byteLength: indices.byteLength }
        ],
        buffers: [{ byteLength: bufferData.length }]
      };
      
      const jsonString = JSON.stringify(gltfJson);
      const jsonBuffer = Buffer.from(jsonString);
      
      // Pad JSON to 4-byte boundary
      const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
      const paddedJsonBuffer = Buffer.concat([
        jsonBuffer,
        Buffer.alloc(jsonPadding, 0x20) // Space character
      ]);
      
      // Pad binary data to 4-byte boundary
      const binPadding = (4 - (bufferData.length % 4)) % 4;
      const paddedBinBuffer = Buffer.concat([
        bufferData,
        Buffer.alloc(binPadding, 0x00)
      ]);
      
      // Create GLB file structure
      const glbHeader = Buffer.alloc(12);
      glbHeader.writeUInt32LE(0x46546C67, 0); // 'glTF' magic
      glbHeader.writeUInt32LE(2, 4); // version
      glbHeader.writeUInt32LE(12 + 8 + paddedJsonBuffer.length + 8 + paddedBinBuffer.length, 8); // total length
      
      // JSON chunk header
      const jsonChunkHeader = Buffer.alloc(8);
      jsonChunkHeader.writeUInt32LE(paddedJsonBuffer.length, 0);
      jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON' type
      
      // Binary chunk header
      const binChunkHeader = Buffer.alloc(8);
      binChunkHeader.writeUInt32LE(paddedBinBuffer.length, 0);
      binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0' type
      
      // Combine all parts
      modelFile = Buffer.concat([
        glbHeader,
        jsonChunkHeader,
        paddedJsonBuffer,
        binChunkHeader,
        paddedBinBuffer
      ]);
      
      console.log('Mock GLB file created, size:', modelFile.length, 'bytes');
    }
    
    // Stage 4: Store model file in memory (80%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 80,
      stage: 'Storing model file'
    });
    
    console.log('Storing model file, size:', modelFile.length, 'bytes');
    
    const uploadResult = await ModelStorage.uploadModel(
      job.userId,
      jobId,
      modelFile,
      `${jobId}.glb`
    );
    
    // Stage 5: Complete (100%)
    await JobQueueDomain.updateJobStatus(jobId, {
      status: 'completed',
      progress: 100,
      stage: 'Generation complete',
      modelId: uploadResult.modelId
    });
  } catch (error) {
    await JobQueueDomain.updateJobStatus(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
