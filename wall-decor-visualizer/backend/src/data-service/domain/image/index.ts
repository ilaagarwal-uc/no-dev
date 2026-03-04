import { IImage, IImageMetadata } from './image_schema';

export const validateImageMetadata = (metadata: IImageMetadata): boolean => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxFileSize = 10485760; // 10MB

  return (
    !!metadata.fileName &&
    metadata.fileSize > 0 &&
    metadata.fileSize <= maxFileSize &&
    validMimeTypes.includes(metadata.mimeType) &&
    metadata.width > 0 &&
    metadata.height > 0
  );
};

export const calculateImageDimensions = (width: number, height: number): { aspectRatio: number } => {
  return {
    aspectRatio: width / height
  };
};
