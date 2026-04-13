/**
 * User Routes
 *
 * Profile management and onboarding endpoints.
 * NOTE: authenticateToken is applied at the app level for /api/user,
 * so it is NOT applied per-route here.
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// ---- Validation Schemas ----

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  preferredLanguage: z.enum(['en', 'hi', 'mixed']).optional(),
  primaryProblemType: z.enum([
    'property_dispute',
    'criminal_matter',
    'family_matter',
    'consumer_complaint',
    'employment_issue',
    'business_contract',
    'rti_information',
    'traffic_vehicle',
    'cyber_crime',
    'tenant_landlord',
    'cheque_bounce',
    'domestic_violence',
    'other',
  ]).optional(),
  problemDescription: z.string().optional(),
  email: z.string().email().optional(),
  profile: z.object({
    age: z.number().int().min(1).max(150).optional(),
    gender: z.string().optional(),
    occupation: z.string().optional(),
    incomeCategory: z.enum(['bpl', 'lower', 'middle', 'upper']).optional(),
    hasExistingLawyer: z.boolean().optional(),
    urgencyLevel: z.enum(['exploring', 'need_soon', 'urgent', 'emergency']).optional(),
    opposingPartyType: z.enum(['individual', 'company', 'government', 'unknown']).optional(),
  }).partial().optional(),
});

const onboardingSchema = z.object({
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  preferredLanguage: z.enum(['en', 'hi', 'mixed']).optional(),
  primaryProblemType: z.enum([
    'property_dispute',
    'criminal_matter',
    'family_matter',
    'consumer_complaint',
    'employment_issue',
    'business_contract',
    'rti_information',
    'traffic_vehicle',
    'cyber_crime',
    'tenant_landlord',
    'cheque_bounce',
    'domestic_violence',
    'other',
  ]).optional(),
  problemDescription: z.string().optional(),
});

// ---- Routes ----

/**
 * GET /profile
 * Return the authenticated user's profile.
 */
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId!);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Strip sensitive fields before returning
    const { passwordHash, refreshToken, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /profile
 * Update the authenticated user's profile fields.
 */
router.patch('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const updateData: Record<string, any> = {};
    const { profile, ...directFields } = validation.data;

    // Set direct (top-level) fields
    for (const [key, value] of Object.entries(directFields)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    // Set nested profile fields using dot notation to avoid overwriting the entire subdoc
    if (profile) {
      for (const [key, value] of Object.entries(profile)) {
        if (value !== undefined) {
          updateData[`profile.${key}`] = value;
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId!,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Strip sensitive fields before returning
    const { passwordHash, refreshToken, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /onboarding
 * Complete the user onboarding flow.
 */
router.post('/onboarding', async (req: AuthRequest, res: Response) => {
  try {
    const validation = onboardingSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { state, district, preferredLanguage, primaryProblemType, problemDescription } = validation.data;

    const updateData: Record<string, any> = {
      state,
      district,
      onboardingCompleted: true,
    };

    if (preferredLanguage) updateData.preferredLanguage = preferredLanguage;
    if (primaryProblemType) updateData.primaryProblemType = primaryProblemType;
    if (problemDescription !== undefined) updateData.problemDescription = problemDescription;

    const user = await User.findByIdAndUpdate(
      req.userId!,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Strip sensitive fields before returning
    const { passwordHash, refreshToken, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /account
 * Permanently delete the user's account and all associated data.
 * Required by Google Play Store policy.
 */
router.delete('/account', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Delete all user's messages (via conversations)
    const conversationList = await Conversation.find({ userId });
    for (const c of conversationList) {
      await Message.deleteMany({ conversationId: c._id });
    }
    await Conversation.deleteMany({ userId });
    await User.findByIdAndDelete(userId!);

    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
