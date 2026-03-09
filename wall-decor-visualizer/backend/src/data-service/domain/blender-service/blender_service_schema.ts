// Type definitions for Blender service

export interface IBlenderExecutionRequest {
  script: string;
  outputPath: string;
  timeout?: number; // milliseconds
}

export interface IBlenderExecutionResult {
  success: boolean;
  outputFile: string;
  executionTime: number;
  error?: string;
  warning?: string;
}

export interface IBlenderValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
