// Backend API Logger
// Logs all API calls with request parameters and responses

import { Request, Response, NextFunction } from 'express';

export function apiLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Log request
  console.log('\n🔵 === API REQUEST ===');
  console.log(`📍 API: ${req.method} ${req.path}`);
  console.log(`📦 Params:`, JSON.stringify(req.body, null, 2));
  console.log(`🔍 Query:`, JSON.stringify(req.query, null, 2));
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  // Capture original send function
  const originalSend = res.send;
  
  // Override send to log response
  res.send = function(data: any): Response {
    const duration = Date.now() - startTime;
    const isError = res.statusCode >= 400;
    const icon = isError ? '🔴' : '🟢';
    
    console.log(`\n${icon} === API RESPONSE ===`);
    console.log(`📍 API: ${req.method} ${req.path}`);
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📄 Response:`, typeof data === 'string' ? data : JSON.stringify(JSON.parse(data), null, 2));
    console.log('===================\n');
    
    return originalSend.call(this, data);
  };
  
  next();
}
