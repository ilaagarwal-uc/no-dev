// API endpoint for generating 3D model
import { Request, Response } from 'express';
import * as ModelGenerationDomain from '../../domain/model-generation/index.js';
import * as JobQueueDomain from '../../domain/job-queue/index.js';
import * as GeminiService from '../../domain/gemini-service/index.js';
import * as BlenderService from '../../domain/blender-service/index.js';
import * as ModelStorage from '../../domain/model-storage/index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function generateModelHandler(req: Request, res: Response): Promise<void> {
  try {
    const { userId, imageId, dimensionData, imageUrl } = req.body;
    
    console.log('Generate model request received:', {
      userId,
      imageId,
      hasDimensionData: !!dimensionData,
      hasImageUrl: !!imageUrl
    });
    
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
    
    const jobId = await JobQueueDomain.queueJob(userId, imageId, dimensionData, imageUrl);
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

// Default wall skeleton script used as fallback when Gemini/Blender fails
function getDefaultWallScript(outputPath: string): string {
  return `
import bpy

OUTPUT_PATH = '${outputPath}'

def create_wall_skeleton():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    ft_to_m = 0.3048

    wall_width = 14.5 * ft_to_m
    wall_height = 9.0 * ft_to_m
    wall_thickness = 0.15

    bpy.ops.mesh.primitive_cube_add(size=1, location=(wall_width / 2, wall_thickness / 2, wall_height / 2))
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (wall_width, wall_thickness, wall_height)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    cutout_width = 7.0 * ft_to_m
    cutout_height = 8.0 * ft_to_m
    cutout_thickness = 0.5

    bpy.ops.mesh.primitive_cube_add(size=1, location=(cutout_width / 2, wall_thickness / 2, cutout_height / 2))
    cutout = bpy.context.active_object
    cutout.name = "Cutout_Volume"
    cutout.scale = (cutout_width, cutout_thickness, cutout_height)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    bool_mod = wall.modifiers.new(name="WallCutout", type='BOOLEAN')
    bool_mod.object = cutout
    bool_mod.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier="WallCutout")
    bpy.data.objects.remove(cutout, do_unlink=True)

    bpy.ops.export_scene.gltf(filepath=OUTPUT_PATH, export_format='GLB', use_selection=False)

create_wall_skeleton()
`;
}

// Injects OUTPUT_PATH and replaces any hardcoded filepath in a Gemini-generated script
function injectOutputPath(script: string, outputPath: string): string {
  // Replace any existing filepath='...' or filepath="..." with our path
  const withPath = script.replace(
    /filepath\s*=\s*r?['"][^'"]*['"]/g,
    `filepath='${outputPath}'`
  );

  // Prepend OUTPUT_PATH variable for scripts that reference it by name
  return `OUTPUT_PATH = '${outputPath}'\n\n` + withPath;
}

async function processModelGenerationJob(jobId: string): Promise<void> {
  try {
    const job = await JobQueueDomain.getJobStatus(jobId);
    if (!job) throw new Error(`Job not found: ${jobId}`);

    const outputPath = `/tmp/${jobId}.glb`;
    
    // Create local output directory for debugging
    const localOutputDir = path.join(process.cwd(), 'output');
    try {
      await fs.mkdir(localOutputDir, { recursive: true });
    } catch (e) {
      // Directory may already exist
    }

    // Stage 1: Validate (10%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 10,
      stage: 'Validating dimension data'
    });

    // Fetch image from GCP Storage if available
    let imageBase64: string | undefined;
    if (job.imageUrl) {
      try {
        console.log('Fetching image from GCP Storage:', job.imageUrl);

        const urlParts = job.imageUrl.split('/');
        const userId = urlParts[urlParts.length - 3];
        const imageId = urlParts[urlParts.length - 2];
        const filename = urlParts[urlParts.length - 1];
        const gcpPath = `${userId}/${imageId}/${filename}`;

        const { Storage } = await import('@google-cloud/storage');
        const storage = new Storage({
          projectId: process.env.GCP_PROJECT_ID,
          credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || '{}')
        });

        const [buffer] = await storage
          .bucket(process.env.GCP_BUCKET_NAME || 'wall-decor-visualizer-images')
          .file(gcpPath)
          .download();

        imageBase64 = buffer.toString('base64');
        console.log('Image fetched successfully, size:', buffer.length, 'bytes');
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

    let blenderScript: string;
    try {
      const geminiScript = await GeminiService.generateBlenderScript(job.dimensionData, imageBase64);
      blenderScript = injectOutputPath(geminiScript, outputPath);
      console.log('Gemini script ready, length:', blenderScript.length);
      
      // Save script locally for debugging
      const scriptPath = path.join(localOutputDir, `${jobId}_script.py`);
      await fs.writeFile(scriptPath, blenderScript);
      console.log('Script saved locally:', scriptPath);
    } catch (error) {
      console.warn('Gemini script generation failed, using default wall skeleton:', error);
      blenderScript = getDefaultWallScript(outputPath);
      
      // Save fallback script locally for debugging
      const scriptPath = path.join(localOutputDir, `${jobId}_fallback_script.py`);
      await fs.writeFile(scriptPath, blenderScript);
      console.log('Fallback script saved locally:', scriptPath);
    }

    // Stage 3: Execute Blender (60%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 60,
      stage: 'Executing Blender script'
    });

    let modelFile: Buffer;

    try {
      const result = await BlenderService.executeBlenderScript(blenderScript, outputPath);
      if (result.warning) console.warn('Blender warning:', result.warning);

      modelFile = await fs.readFile(outputPath);
      console.log('GLB generated by Blender, size:', modelFile.length, 'bytes');
      
      // Save model locally for debugging
      const localModelPath = path.join(localOutputDir, `${jobId}.glb`);
      await fs.writeFile(localModelPath, modelFile);
      console.log('Model saved locally:', localModelPath);
    } catch (blenderError) {
      console.error('Blender execution failed, retrying with default wall skeleton:', blenderError);

      // Retry once with the known-good default script
      try {
        const fallbackScript = getDefaultWallScript(outputPath);
        
        // Save fallback script locally
        const fallbackScriptPath = path.join(localOutputDir, `${jobId}_retry_fallback_script.py`);
        await fs.writeFile(fallbackScriptPath, fallbackScript);
        console.log('Retry fallback script saved locally:', fallbackScriptPath);
        
        await BlenderService.executeBlenderScript(fallbackScript, outputPath);
        modelFile = await fs.readFile(outputPath);
        console.log('Default wall skeleton GLB generated, size:', modelFile.length, 'bytes');
        
        // Save model locally for debugging
        const localModelPath = path.join(localOutputDir, `${jobId}.glb`);
        await fs.writeFile(localModelPath, modelFile);
        console.log('Model saved locally:', localModelPath);
      } catch (fallbackError) {
        throw new Error(`Both Gemini and default Blender scripts failed: ${fallbackError}`);
      }
    } finally {
      await fs.unlink(outputPath).catch(() => {});
    }

    // Stage 4: Store model (80%)
    await JobQueueDomain.updateJobStatus(jobId, {
      progress: 80,
      stage: 'Storing model file'
    });

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
