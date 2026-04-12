/**
 * Authentication Routes
 *
 * Handles user registration, login, token refresh, and logout.
 * Uses JWT access + refresh token pattern for session management.
 */

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { env } from '../config/env';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// ---- Validation Schemas ----

const registerSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be at most 100 characters'),
});

const loginSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ---- Helpers ----

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: (env.jwtExpiresIn || '15m') as string,
  } as jwt.SignOptions);
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, env.jwtRefreshSecret, {
    expiresIn: (env.jwtRefreshExpiresIn || '7d') as string,
  } as jwt.SignOptions);
}

// ---- Routes ----

/**
 * POST /register
 * Create a new user account.
 */
router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { phone, password, fullName } = validation.data;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      res.status(409).json({ error: 'Phone number already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      phone,
      passwordHash,
      fullName,
    });

    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
        onboardingCompleted: user.onboardingCompleted,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /login
 * Authenticate with phone and password.
 */
router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { phone, password } = validation.data;

    const user = await User.findOne({ phone }).select('+passwordHash +refreshToken');
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const accessToken = generateAccessToken(String(user._id));
    const refreshToken = generateRefreshToken(String(user._id));

    user.refreshToken = refreshToken;
    user.lastActiveAt = new Date();
    await user.save();

    res.json({
      user: {
        id: user._id,
        phone: user.phone,
        fullName: user.fullName,
        state: user.state,
        district: user.district,
        preferredLanguage: user.preferredLanguage,
        primaryProblemType: user.primaryProblemType,
        onboardingCompleted: user.onboardingCompleted,
        profile: user.profile,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /refresh
 * Get a new access token using a valid refresh token.
 */
router.post('/refresh', async (req: AuthRequest, res: Response) => {
  try {
    const validation = refreshSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { refreshToken } = validation.data;

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as { userId: string };
    } catch {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const accessToken = generateAccessToken(String(user._id));

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /logout
 * Invalidate the user's refresh token.
 */
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: '' });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
