export interface IGenerateScriptApiRequest {
  imageUrl: string;
  dimensions: Array<{
    name: string;
    width: number;
    height: number;
    unit: string;
  }>;
}

export interface IGenerateScriptApiResponse {
  success: boolean;
  blenderScript: string;
  jobId: string;
}

export const handleGenerateScript = async (data: IGenerateScriptApiRequest): Promise<IGenerateScriptApiResponse> => {
  // Implementation will be added
  return {
    success: false,
    blenderScript: '',
    jobId: ''
  };
};
