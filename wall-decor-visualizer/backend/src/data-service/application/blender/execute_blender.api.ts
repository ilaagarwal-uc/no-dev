export interface IExecuteBlenderApiRequest {
  script: string;
  imageId: string;
}

export interface IExecuteBlenderApiResponse {
  success: boolean;
  jobId: string;
  status: string;
}

export const handleExecuteBlender = async (data: IExecuteBlenderApiRequest): Promise<IExecuteBlenderApiResponse> => {
  // Implementation will be added
  return {
    success: false,
    jobId: '',
    status: 'queued'
  };
};
