// API call for downloading model
import { DownloadModelError } from '../errors.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function downloadModelApi(modelId: string, fileName: string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/model/${modelId}/download`;
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    throw new DownloadModelError(
      `Failed to download model: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
