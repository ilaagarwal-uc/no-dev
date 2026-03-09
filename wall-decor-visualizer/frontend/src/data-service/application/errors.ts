export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class DimensionMarkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DimensionMarkError';
  }
}

export class SaveError extends DimensionMarkError {
  constructor(message: string) {
    super(message);
    this.name = 'SaveError';
  }
}

export class SkipError extends DimensionMarkError {
  constructor(message: string) {
    super(message);
    this.name = 'SkipError';
  }
}

export class ModelGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelGenerationError';
  }
}

export class GenerateModelError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'GenerateModelError';
  }
}

export class JobStatusError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'JobStatusError';
  }
}

export class CancelJobError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'CancelJobError';
  }
}

export class GetModelError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'GetModelError';
  }
}

export class DownloadModelError extends ModelGenerationError {
  constructor(message: string) {
    super(message);
    this.name = 'DownloadModelError';
  }
}

export class CatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogError';
  }
}

export class CatalogLoadError extends CatalogError {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogLoadError';
  }
}
