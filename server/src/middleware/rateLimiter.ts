/**
 * Rate Limiting Middleware
 *
 * Provides two rate limiters built on express-rate-limit:
 * - generalLimiter: applied to all routes (100 req / 15 min per IP)
 * - chatLimiter:    applied to chat endpoints (20 req / 1 min per IP)
 *
 * Limits are per IP address by default.
 */

import rateLimit from 'express-rate-limit';

/**
 * General rate limiter — 100 requests per 15-minute window.
 * Applied globally to all API routes.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,  // Disable X-RateLimit-* headers
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests. Please try again after 15 minutes.',
  },
});

/**
 * Chat-specific rate limiter — 20 requests per 1-minute window.
 * Applied only to the chat / message endpoints to prevent abuse
 * of the AI API.
 */
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many chat requests. Please wait a minute before sending more messages.',
  },
});
