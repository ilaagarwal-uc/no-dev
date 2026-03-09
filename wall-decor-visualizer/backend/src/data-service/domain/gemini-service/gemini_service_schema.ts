// Type definitions for Gemini service

export interface IGeminiRequest {
  dimensionData: any;
  imageData: string; // base64
  prompt: string;
}

export interface IGeminiResponse {
  script: string;
  metadata?: {
    tokensUsed: number;
    modelVersion: string;
  };
}

export interface IGeminiError {
  code: string;
  message: string;
  retryable: boolean;
}
