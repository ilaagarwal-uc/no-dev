// Gemini API integration logic
import * as GeminiSchema from './gemini_service_schema.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';

// Initialize Gemini API client
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    console.log('Initializing Gemini API client with key:', `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// Load prompt template
let PROMPT_TEMPLATE: string | null = null;

async function loadPromptTemplate(): Promise<string> {
  if (PROMPT_TEMPLATE) {
    return PROMPT_TEMPLATE;
  }
  
  try {
    // Go up two levels from backend directory to reach project root
    const promptPath = path.join(process.cwd(), '../../.kiro/specs/wall-decor-visualizer/prompts/model_generator_3d.prompt');
    const content = await fs.readFile(promptPath, 'utf-8');
    
    // Extract PROMPT_STEP_1_DIMENSIONS from the file
    const match = content.match(/PROMPT_STEP_1_DIMENSIONS\s*=\s*\(([\s\S]*?)\)/);
    if (match) {
      // Remove quotes and concatenate the string
      PROMPT_TEMPLATE = match[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'))
        .join('\n')
        .replace(/^['"]|['"]$/g, '')
        .replace(/['"]\s*\n\s*['"]/g, '\n');
    } else {
      throw new Error('Could not find PROMPT_STEP_1_DIMENSIONS in prompt file');
    }
    
    return PROMPT_TEMPLATE;
  } catch (error) {
    console.error('Failed to load prompt template:', error);
    // Fallback to inline prompt
    PROMPT_TEMPLATE = `Analyze the provided images to reconstruct the structural "Skeleton" of the wall. 
Ignore all furniture, lights and artwork. Focus ONLY on: 
Only consider the area marked on the image, nothing to be considered beyond the marked area. 
The Main Wall boundaries (Outer dimensions). 
The Return Wall boundaries (Outer dimensions). 
Return wall corners are mentioned as black angle with blue dot. Identify its side and direction wrt main main wall. 
Return wall width and depth from annotations. If black angle with blue dot is not there then don't consider the return wall.`;
    return PROMPT_TEMPLATE;
  }
}

export async function generateBlenderScript(
  dimensionData: any,
  imageBase64?: string
): Promise<string> {
  try {
    // Format prompt with dimension data
    const prompt = await formatPrompt(dimensionData);
    
    // Call Gemini API with image data
    const response = await callGeminiAPI(prompt, imageBase64);
    
    // Parse and validate script
    const script = parseGeminiResponse(response);
    validateBlenderScript(script);
    
    return script;
  } catch (error) {
    console.error('Error generating Blender script:', error);
    throw error;
  }
}

export async function formatPrompt(dimensionData: any): Promise<string> {
  const template = await loadPromptTemplate();
  
  // Format the prompt with dimension data
  const dimensionJson = JSON.stringify(dimensionData, null, 2);
  
  return `${template}

DIMENSION DATA PROVIDED:
${dimensionJson}

Generate an executable Blender Python script that can be run in headless blender:
- Use bpy.ops.export_scene.gltf() with export_format='GLB' parameter
- Set use_selection=False in export to ensure all objects are exported
- Remove the __main__ guard and call create_wall_skeleton() directly

IMPORTANT NOTES:
- Export to GLB format to include all data in a single file
`;
}

export async function callGeminiAPI(prompt: string, imageBase64?: string): Promise<GeminiSchema.IGeminiResponse> {
  const timestamp = new Date().toISOString();
  
  try {
    console.log('\n========== GEMINI API CALL START ==========');
    console.log('Timestamp:', timestamp);
    
    // Get Gemini client (lazy initialization ensures API key is loaded)
    const client = getGeminiClient();
    
    const apiKey = process.env.GEMINI_API_KEY || '';
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT FOUND');
    console.log('Model:', 'gemini-2.5-flash');
    console.log('Image provided:', imageBase64 ? 'Yes' : 'No');
    if (imageBase64) {
      console.log('Image data length:', imageBase64.length, 'characters');
    }
    console.log('Prompt length:', prompt.length, 'characters');
    console.log('\n--- FULL PROMPT START ---');
    console.log(prompt);
    console.log('--- FULL PROMPT END ---\n');
    
    // Use Gemini 2.5 Flash Latest (stable model with v1 API support)
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2
      }
    });
    
    console.log('Generation Config:', {
      temperature: 0.2
    });
    
    let result;
    
    if (imageBase64) {
      // Image data provided directly as base64
      console.log('Calling Gemini API with image data...');
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ]);
      console.log('Gemini API call completed successfully (with image)');
    } else {
      // Text-only request
      console.log('Calling Gemini API (text-only)...');
      result = await model.generateContent(prompt);
      console.log('Gemini API call completed successfully (text-only)');
    }
    
    const response = result.response;
    const text = response.text();
    
    console.log('Response received');
    console.log('Response text length:', text.length, 'characters');
    console.log('\n\n\n\n\n\n\n\n\n\n\n--- FULL RESPONSE START ---');
    console.log('\n-------------------------------------------------');
    console.log(text);
    console.log('--- FULL RESPONSE END ---\n');
    
    // Extract Python script from response (it might be wrapped in markdown code blocks)
    let script = text.trim();
    
    // Try to extract from Python code block
    const pythonCodeBlockMatch = text.match(/```python\n([\s\S]*?)\n```/);
    if (pythonCodeBlockMatch) {
      script = pythonCodeBlockMatch[1];
      console.log('Extracted Python script from markdown python code block');
    } else {
      // Try generic code block
      const genericCodeBlockMatch = text.match(/```\n([\s\S]*?)\n```/);
      if (genericCodeBlockMatch) {
        script = genericCodeBlockMatch[1];
        console.log('Extracted script from generic markdown code block');
      } else {
        console.log('No code block found, using raw response as script');
      }
    }
    
    console.log('Final script length:', script.trim().length, 'characters');
    console.log('========== GEMINI API CALL END ==========\n');
    
    return {
      script: script.trim(),
      metadata: {
        tokensUsed: 0, // Gemini API doesn't provide token count in this version
        modelVersion: 'gemini-2.5-flash'
      }
    };
  } catch (error: any) {
    console.error('\n========== GEMINI API ERROR ==========');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error status:', error.status);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('========== GEMINI API ERROR END ==========\n');
    
    // Determine if error is retryable
    const retryable = error.status === 429 || error.status === 503 || error.status === 500;
    
    throw {
      code: error.status?.toString() || 'UNKNOWN_ERROR',
      message: error.message || 'Failed to call Gemini API',
      retryable
    } as GeminiSchema.IGeminiError;
  }
}

export function parseGeminiResponse(response: GeminiSchema.IGeminiResponse): string {
  if (!response.script) {
    throw new Error('No script in Gemini response');
  }
  return response.script;
}

export function validateBlenderScript(script: string): void {
  // Validate Python script structure
  const errors: string[] = [];
  
  // Check for required imports
  if (!script.includes('import bpy')) {
    errors.push('Missing required import: bpy');
  }
  
  // Check for glTF export
  if (!script.includes('export_scene.gltf') && !script.includes('export_scene.glb')) {
    errors.push('Script does not export to glTF/GLB format');
  }
  
  // Check for dangerous operations
  if (script.includes('os.system') || script.includes('subprocess.call')) {
    errors.push('Script contains potentially dangerous operations');
  }
  
  // Check script is not empty
  if (script.trim().length === 0) {
    errors.push('Script is empty');
  }
  
  if (errors.length > 0) {
    throw new Error(`Blender script validation failed: ${errors.join(', ')}`);
  }
  
  console.log('Blender script validation passed');
}

export type { IGeminiRequest, IGeminiResponse, IGeminiError } from './gemini_service_schema.js';
