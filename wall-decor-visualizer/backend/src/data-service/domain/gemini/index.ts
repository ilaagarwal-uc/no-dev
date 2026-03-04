import { IGeminiRequest, IDimension } from './gemini_schema';

export const validateGeminiRequest = (request: IGeminiRequest): boolean => {
  return (
    !!request.prompt &&
    !!request.imageUrl &&
    request.dimensions.length > 0 &&
    request.dimensions.every(d => !!d.name && d.width > 0 && d.height > 0)
  );
};

export const formatDimensionsForPrompt = (dimensions: IDimension[]): string => {
  return dimensions
    .map(d => `${d.name}: ${d.width}${d.unit} x ${d.height}${d.unit}`)
    .join(', ');
};
