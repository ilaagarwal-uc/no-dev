// Gemini API integration logic
import * as GeminiSchema from './gemini_service_schema.js';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs/promises';
import path from 'path';

// Initialize Gemini API client
let genAI: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    genAI = new GoogleGenAI({ apiKey, apiVersion: 'v1beta' });
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
    const promptPath = path.join(process.cwd(), '../../.kiro/specs/wall-decor-visualizer/prompts/model_generator_3d.prompt');
    const content = await fs.readFile(promptPath, 'utf-8');
    
    const match = content.match(/PROMPT_STEP_1_DIMENSIONS\s*=\s*\(([\s\S]*?)\)/);
    if (match) {
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
  const prompt = await formatPrompt(dimensionData);
  const response = await callGeminiAPI(prompt, imageBase64);
  const script = parseGeminiResponse(response);
  validateBlenderScript(script);
  return script;
}

export async function formatPrompt(dimensionData: any): Promise<string> {
  const template = await loadPromptTemplate();
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

Before outputting the blender file check there are no execution errors in the file, 
if there are generate again n return that one

`;
}

export async function callGeminiAPI(prompt: string, imageBase64?: string): Promise<GeminiSchema.IGeminiResponse> {
  try {
    const client = getGeminiClient();
    
    let result;
    
    if (imageBase64) {
      result = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: 'image/jpeg'
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0.2
        }
      });
    } else {
      result = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          temperature: 0.2
        }
      });
    }
    
    const text = result.text || '';
    
    // Extract Python script from response (it might be wrapped in markdown code blocks)
    let script = text.trim();
    
    const pythonCodeBlockMatch = text.match(/```python\n([\s\S]*?)\n```/);
    if (pythonCodeBlockMatch) {
      script = pythonCodeBlockMatch[1];
    } else {
      const genericCodeBlockMatch = text.match(/```\n([\s\S]*?)\n```/);
      if (genericCodeBlockMatch) {
        script = genericCodeBlockMatch[1];
      }
    }
    
    return {
      script: script.trim(),
      metadata: {
        tokensUsed: 0,
        modelVersion: 'gemini-3-flash-preview'
      }
    };
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    
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
  const errors: string[] = [];
  
  if (!script.includes('import bpy')) {
    errors.push('Missing required import: bpy');
  }
  
  if (!script.includes('export_scene.gltf') && !script.includes('export_scene.glb')) {
    errors.push('Script does not export to glTF/GLB format');
  }
  
  if (script.includes('os.system') || script.includes('subprocess.call')) {
    errors.push('Script contains potentially dangerous operations');
  }
  
  if (script.trim().length === 0) {
    errors.push('Script is empty');
  }
  
  if (errors.length > 0) {
    throw new Error(`Blender script validation failed: ${errors.join(', ')}`);
  }
}

export type { IGeminiRequest, IGeminiResponse, IGeminiError } from './gemini_service_schema.js';
