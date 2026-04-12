import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: number;
}

export function errorHandler(
  err: ErrorWithStatusCode,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (env.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Request validation failed.',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Custom AppError with statusCode
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  // Generic errors with a statusCode property
  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
    });
    return;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'ValidationError',
      message: err.message,
    });
    return;
  }

  // Mongoose cast errors (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      error: 'BadRequest',
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.name === 'MongoServerError' && err.code === 11000) {
    res.status(409).json({
      error: 'Conflict',
      message: err.message,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
    });
    return;
  }

  // Default: 500 Internal Server Error
  res.status(500).json({
    error: 'Internal Server Error',
    message:
      env.nodeEnv === 'production'
        ? 'An unexpected error occurred.'
        : err.message || 'An unexpected error occurred.',
  });
}
