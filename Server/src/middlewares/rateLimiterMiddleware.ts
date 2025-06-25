import rateLimit from 'express-rate-limit';

export const rateLimiterMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per minute
  message: 'Too many status checks. Please wait a moment.'
});