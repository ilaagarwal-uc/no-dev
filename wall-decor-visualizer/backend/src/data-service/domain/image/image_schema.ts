export interface IImage {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  gcsUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  uploadedAt: Date;
  updatedAt: Date;
}

export interface IImageMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
}

export type ImageStatus = 'uploading' | 'uploaded' | 'processing' | 'failed';
