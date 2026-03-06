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
