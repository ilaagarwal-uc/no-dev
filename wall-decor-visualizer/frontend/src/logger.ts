// Frontend API Logger
// Logs all API calls with request parameters and responses

interface ILogAPICallParams {
  apiName: string;
  method: string;
  params?: any;
  query?: any;
}

interface ILogAPIResponseParams {
  apiName: string;
  method: string;
  status: number;
  duration: number;
  response: any;
  error?: boolean;
}

export function logAPICall({ apiName, method, params, query }: ILogAPICallParams): number {
  const startTime = Date.now();
  
  console.log('\n🔵 === API REQUEST ===');
  console.log(`📍 API: ${method} ${apiName}`);
  if (params) {
    console.log(`📦 Params:`, params);
  }
  if (query) {
    console.log(`🔍 Query:`, query);
  }
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  return startTime;
}

export function logAPIResponse({ apiName, method, status, duration, response, error = false }: ILogAPIResponseParams): void {
  const icon = error ? '🔴' : '🟢';
  
  console.log(`\n${icon} === API RESPONSE ===`);
  console.log(`📍 API: ${method} ${apiName}`);
  console.log(`📊 Status: ${status}`);
  console.log(`⏱️  Duration: ${duration}ms`);
  console.log(`📄 Response:`, response);
  console.log('===================\n');
}

export function logAPIError({ apiName, method, error }: { apiName: string; method: string; error: any }): void {
  console.log('\n🔴 === API ERROR ===');
  console.log(`📍 API: ${method} ${apiName}`);
  console.log(`❌ Error:`, error.message || error);
  if (error.response) {
    console.log(`📊 Status: ${error.response.status}`);
    console.log(`📄 Response:`, error.response.data);
  }
  console.log('===================\n');
}
