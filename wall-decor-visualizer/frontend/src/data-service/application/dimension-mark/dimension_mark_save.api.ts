// API call for saving dimension markings
import * as DimensionMarkDomain from '../../domain/dimension-mark/index.js';
import { SaveError } from '../errors.js';

export async function saveDimensionsApi(
  request: DimensionMarkDomain.ISaveDimensionsRequest
): Promise<DimensionMarkDomain.ISaveDimensionsResponse> {
  // Validate request
  if (!DimensionMarkDomain.validateSaveRequest(request)) {
    throw new SaveError('Invalid save request');
  }

  try {
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('imageUrl', request.imageUrl);
    formData.append('annotations', JSON.stringify(request.annotations));
    formData.append('mergedImage', request.mergedImageBlob);

    // Call backend API
    const response = await fetch('/api/dimension-mark/save', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new SaveError(`Save failed with status ${response.status}`);
    }

    const data = await response.json();
    return data as DimensionMarkDomain.ISaveDimensionsResponse;
  } catch (error) {
    if (error instanceof SaveError) {
      throw error;
    }
    throw new SaveError(`Failed to save dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
