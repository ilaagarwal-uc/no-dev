// page-service Application Layer - Error Classes

export class PageBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PageBuildError';
  }
}

export class PageNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PageNotFoundError';
  }
}

export class InvalidPageRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPageRequestError';
  }
}
