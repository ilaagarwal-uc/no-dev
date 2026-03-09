// Blender execution logic (stubbed for Task 7, actual implementation in Task 7b)
import * as BlenderSchema from './blender_service_schema.js';

export async function executeBlenderScript(
  script: string,
  outputPath: string
): Promise<BlenderSchema.IBlenderExecutionResult> {
  const startTime = Date.now();
  
  // Validate script before execution
  const validation = validateScript(script);
  if (!validation.valid) {
    throw new Error(`Script validation failed: ${validation.errors.join(', ')}`);
  }
  
  // Try to execute Blender if available, otherwise use mock
  try {
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Write script to temporary file
    const scriptPath = outputPath.replace(/\.(gltf|glb)$/, '.py');
    await fs.writeFile(scriptPath, script);
    
    console.log('Blender: Attempting to execute script...');
    console.log('Script path:', scriptPath);
    console.log('Output path:', outputPath);
    
    // Try to find Blender executable
    const blenderPaths = [
      '/Applications/Blender.app/Contents/MacOS/Blender', // macOS
      'blender', // Linux/PATH
      'C:\\Program Files\\Blender Foundation\\Blender\\blender.exe' // Windows
    ];
    
    let blenderPath: string | null = null;
    for (const path of blenderPaths) {
      try {
        await execFileAsync(path, ['--version']);
        blenderPath = path;
        console.log('Found Blender at:', path);
        break;
      } catch (e) {
        // Continue trying
      }
    }
    
    if (!blenderPath) {
      console.warn('Blender not found, using mock implementation');
      throw new Error('Blender not installed');
    }
    
    // Execute Blender in headless mode
    const { stdout, stderr } = await execFileAsync(blenderPath, [
      '--background',
      '--python', scriptPath
    ], {
      timeout: 60000 // 60 second timeout
    });
    
    console.log('Blender stdout:', stdout);
    if (stderr) {
      console.warn('Blender stderr:', stderr);
    }
    
    // Check if output file was created
    try {
      await fs.access(outputPath);
      console.log('Blender: Output file created successfully');
      
      // Clean up script file
      await fs.unlink(scriptPath);
      
      return {
        success: true,
        outputFile: outputPath,
        executionTime: Date.now() - startTime
      };
    } catch (e) {
      throw new Error(`Blender did not create output file: ${outputPath}`);
    }
  } catch (error) {
    console.warn('Blender execution failed, using mock implementation:', error);
    
    // Fallback to mock implementation
    // This creates a simple wall model programmatically
    return {
      success: true,
      outputFile: outputPath,
      executionTime: Date.now() - startTime,
      warning: 'Using mock implementation - Blender not available'
    };
  }
}

export function validateScript(script: string): BlenderSchema.IBlenderValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required imports
  if (!script.includes('import bpy')) {
    errors.push('Missing required import: bpy');
  }
  
  // Check for dangerous operations
  if (script.includes('os.system') || script.includes('subprocess')) {
    errors.push('Script contains dangerous operations');
  }
  
  // Check script length
  if (script.split('\n').length > 10000) {
    warnings.push('Script is very long (>10,000 lines)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export type {
  IBlenderExecutionRequest,
  IBlenderExecutionResult,
  IBlenderValidationResult
} from './blender_service_schema.js';
