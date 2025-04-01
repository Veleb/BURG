import serverlessHttp from 'serverless-http';
import initializeApp from '../src/index';

let cachedHandler: any;
let isColdStart = true;

export default async (event: any, context: any) => {
  // Reuse existing handler and connection pool
  if (!cachedHandler) {
    const app = await initializeApp();
    cachedHandler = serverlessHttp(app, {
      binary: ['image/*']
    });
    
    // Cold start logging
    if (isColdStart) {
      console.log('Cold start initialization complete');
      isColdStart = false;
    }
  }

  // Reset context for Lambda
  context.callbackWaitsForEmptyEventLoop = false;

  // Add timeout protection
  return Promise.race([
    cachedHandler(event, context),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout after 9.5s')), 9500)
  )])
  .catch(error => ({
    statusCode: 504,
    body: JSON.stringify({ 
      error: 'Gateway Timeout',
      message: error.message
    })
  }));
};