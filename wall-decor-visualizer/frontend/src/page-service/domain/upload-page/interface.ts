export interface IImageUploaderProps {
  userId: string;
  onUploadSuccess: (imageId: string, gcpUrl: string) => void;
  onUploadError: (error: string) => void;
}

export interface ICameraCaptureProps {
  userId: string;
  onCaptureSuccess: (imageId: string, gcpUrl: string) => void;
  onCaptureError: (error: string) => void;
  onCancel: () => void;
}

export interface IGlobalHeaderProps {
  userId: string;
  phoneNumber: string;
  onLogout: () => void;
}

export interface IUploadPageProps {
  userId: string;
  phoneNumber: string;
}

export interface IUploadProgress {
  isUploading: boolean;
  progress: number;
  fileName?: string;
  fileSize?: number;
}

export interface IUploadError {
  message: string;
  code: string;
}
