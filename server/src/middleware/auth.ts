/**
 * Authentication Middleware
 *
 * Verifies JSON Web Tokens from the Authorization header.
 * On success, attaches the authenticated user's ID to the request object
 * so downstream handlers can use it.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Extended Express Request that carries the authenticated user's ID.
 */
export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Express middleware that extracts and verifies a Bearer token from the
 * Authorization header. If valid, sets `req.userId` and calls `next()`.
 * Otherwise responds with 401 Unauthorized.
 */
export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required. Provide it via Authorization: Bearer <token>',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'TokenExpired',
        message: 'Access token has expired. Please refresh your token.',
      });
      return;
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid access token.',
    });
  }
}
