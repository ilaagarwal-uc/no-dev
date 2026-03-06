// API call for skipping dimension markings
import * as DimensionMarkDomain from '../../domain/dimension-mark/index.js';
import { SkipError } from '../errors.js';

export async function skipDimensionsApi(
  request: DimensionMarkDomain.ISkipDimensionsRequest
): Promise<DimensionMarkDomain.ISkipDimensionsResponse> {
  // Validate request
  if (!DimensionMarkDomain.validateSkipRequest(request)) {
    throw new SkipError('Invalid skip request');
  }

  try {
    // Call backend API
    const response = await fetch('/api/dimension-mark/skip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new SkipError(`Skip failed with status ${response.status}`);
    }

    const data = await response.json();
    return data as DimensionMarkDomain.ISkipDimensionsResponse;
  } catch (error) {
    if (error instanceof SkipError) {
      throw error;
    }
    throw new SkipError(`Failed to skip dimensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
