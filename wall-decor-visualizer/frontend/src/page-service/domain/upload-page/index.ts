// Validation functions
export function validateImageFormat(mimeType: string): boolean {
  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  return supportedFormats.includes(mimeType);
}

export function validateImageSize(fileSize: number): boolean {
  const MIN_SIZE = 1024; // 1KB
  const MAX_SIZE = 10485760; // 10MB
  return fileSize >= MIN_SIZE && fileSize <= MAX_SIZE;
}

export function validateImageNotEmpty(fileSize: number): boolean {
  return fileSize > 0;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatUploadSpeed(bytesPerSecond: number): string {
  return formatFileSize(bytesPerSecond) + '/s';
}

export function calculateETA(remainingBytes: number, bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return 'Calculating...';
  const seconds = Math.ceil(remainingBytes / bytesPerSecond);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

export function maskPhoneNumber(phoneNumber: string): string {
  // Extract last 4 digits
  const lastFour = phoneNumber.slice(-4);
  // Return masked format: +1 (***) ***-XXXX
  return `+1 (***) ***-${lastFour}`;
}

export function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'INVALID_IMAGE_FORMAT': 'Invalid image format. Please upload JPG, PNG, or WebP.',
    'IMAGE_SIZE_EXCEEDS_LIMIT': 'File size exceeds 10MB limit. Please choose a smaller file.',
    'IMAGE_SIZE_BELOW_MINIMUM': 'File is too small. Minimum size is 1KB.',
    'EMPTY_FILE': 'File is empty. Please choose a valid image.',
    'UNAUTHORIZED': 'Authentication required. Please log in.',
    'GCP_UPLOAD_FAILED': 'Upload failed. Please try again later.',
    'METADATA_STORAGE_FAILED': 'Failed to save image metadata. Please try again.',
    'NETWORK_ERROR': 'Network error. Please check your connection.',
    'UPLOAD_CANCELLED': 'Upload cancelled.',
    'PARSE_ERROR': 'Failed to parse response.',
    'INVALID_REQUEST': 'Invalid request.',
    'SERVER_ERROR': 'Server error. Please try again later.',
    'UPLOAD_FAILED': 'Upload failed. Please try again.',
    'UNEXPECTED_ERROR': 'An unexpected error occurred.'
  };
  return errorMessages[code] || 'An error occurred. Please try again.';
}
