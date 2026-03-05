/**
 * API Logger Middleware
 * Logs all API requests and responses
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to log API requests
 */
export function apiLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const { method, path, query, body } = req;

  // Log request
  console.log(`[${new Date().toISOString()}] ${method} ${path}`);

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${method} ${path} - ${res.statusCode} (${duration}ms)`
    );
    return originalSend.call(this, data);
  };

  next();
}
