export interface IUploadImageApiRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
}

export interface IUploadImageApiResponse {
  success: boolean;
  imageId: string;
  gcsUrl: string;
  uploadUrl: string;
}

export const handleUploadImage = async (data: IUploadImageApiRequest): Promise<IUploadImageApiResponse> => {
  // Implementation will be added
  return {
    success: false,
    imageId: '',
    gcsUrl: '',
    uploadUrl: ''
  };
};
