export interface IGeminiRequest {
  prompt: string;
  imageUrl: string;
  dimensions: IDimension[];
}

export interface IDimension {
  name: string;
  width: number;
  height: number;
  unit: 'ft' | 'in' | 'cm' | 'm';
}

export interface IGeminiResponse {
  blenderScript: string;
  confidence: number;
  detectedObjects: string[];
}

export type GeminiStatus = 'pending' | 'processing' | 'completed' | 'failed';
