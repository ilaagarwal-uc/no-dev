/**
 * Image Upload Domain Schema
 * Defines interfaces for image metadata and storage
 */

export interface IImage {
  imageId: string;
  userId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  gcpPath: string;
  gcpUrl: string;
  uploadedAt: Date;
  updatedAt: Date;
}

export interface IImageDocument extends IImage {
  _id?: string;
}

export interface IImageMetadata {
  imageId: string;
  userId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
}
