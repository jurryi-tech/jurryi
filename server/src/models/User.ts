/**
 * User Model — Firestore Implementation
 * Provides Mongoose-like interface over Firestore.
 */

import { collections, getDb } from '../config/database';
import { FieldValue } from '@google-cloud/firestore';

export type PreferredLanguage = 'en' | 'hi' | 'mixed';

export type PrimaryProblemType =
  | 'property_dispute'
  | 'criminal_matter'
  | 'family_matter'
  | 'consumer_complaint'
  | 'employment_issue'
  | 'business_contract'
  | 'rti_information'
  | 'traffic_vehicle'
  | 'cyber_crime'
  | 'tenant_landlord'
  | 'cheque_bounce'
  | 'domestic_violence'
  | 'other';

export type IncomeCategory = 'bpl' | 'lower' | 'middle' | 'upper';

export type UrgencyLevel = 'exploring' | 'need_soon' | 'urgent' | 'emergency';

export type OpposingPartyType = 'individual' | 'company' | 'government' | 'unknown';

export interface IUserProfile {
  age?: number;
  gender?: string;
  occupation?: string;
  incomeCategory?: IncomeCategory;
  hasExistingLawyer?: boolean;
  urgencyLevel?: UrgencyLevel;
  opposingPartyType?: OpposingPartyType;
}

export interface IUser {
  id: string;
  phone: string;
  email?: string;
  passwordHash: string;
  fullName: string;
  state: string;
  district: string;
  preferredLanguage: PreferredLanguage;
  primaryProblemType?: PrimaryProblemType;
  problemDescription: string;
  profile: IUserProfile;
  refreshToken?: string;
  conversationCount: number;
  lastActiveAt: Date;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function docToUser(id: string, data: FirebaseFirestore.DocumentData): any {
  return {
    id,
    _id: id,  // alias for compatibility
    phone: data.phone || '',
    email: data.email,
    passwordHash: data.passwordHash || '',
    fullName: data.fullName || '',
    state: data.state || '',
    district: data.district || '',
    preferredLanguage: data.preferredLanguage || 'en',
    primaryProblemType: data.primaryProblemType,
    problemDescription: data.problemDescription || '',
    profile: data.profile || {},
    refreshToken: data.refreshToken,
    conversationCount: data.conversationCount || 0,
    lastActiveAt: data.lastActiveAt?.toDate?.() || new Date(),
    onboardingCompleted: data.onboardingCompleted || false,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  };
}

export const User = {
  async create(data: Partial<IUser>): Promise<any> {
    const now = new Date();
    const userData = {
      phone: data.phone || '',
      email: data.email || null,
      passwordHash: data.passwordHash || '',
      fullName: data.fullName || '',
      state: data.state || '',
      district: data.district || '',
      preferredLanguage: data.preferredLanguage || 'en',
      primaryProblemType: data.primaryProblemType || null,
      problemDescription: data.problemDescription || '',
      profile: data.profile || {},
      refreshToken: data.refreshToken || null,
      conversationCount: data.conversationCount || 0,
      lastActiveAt: now,
      onboardingCompleted: data.onboardingCompleted || false,
      createdAt: now,
      updatedAt: now,
    };
    const docRef = await collections.users().add(userData);
    const doc = await docRef.get();
    return docToUser(docRef.id, doc.data()!);
  },

  async findOne(query: Record<string, any>): Promise<any | null> {
    if (query._id || query.id) {
      const docRef = collections.users().doc(String(query._id || query.id));
      const doc = await docRef.get();
      if (!doc.exists) return null;
      const user = docToUser(doc.id, doc.data()!);
      // Check additional query params
      for (const [key, value] of Object.entries(query)) {
        if (key === '_id' || key === 'id') continue;
        if ((user as any)[key] !== value) return null;
      }
      return user;
    }
    let q: FirebaseFirestore.Query = collections.users();
    for (const [key, value] of Object.entries(query)) {
      if (key === '_id' || key === 'id') continue;
      q = q.where(key, '==', value);
    }
    const snapshot = await q.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return docToUser(doc.id, doc.data());
  },

  async findById(id: string): Promise<any | null> {
    if (!id) return null;
    const doc = await collections.users().doc(id).get();
    if (!doc.exists) return null;
    return docToUser(doc.id, doc.data()!);
  },

  async findByIdAndUpdate(id: string, update: Record<string, any>, options?: any): Promise<any | null> {
    if (!id) return null;
    const docRef = collections.users().doc(id);

    // Handle $set and $inc operators
    const flatUpdate: Record<string, any> = {};
    if (update.$set) {
      Object.assign(flatUpdate, update.$set);
    }
    if (update.$inc) {
      for (const [key, val] of Object.entries(update.$inc)) {
        flatUpdate[key] = FieldValue.increment(val as number);
      }
    }
    // Handle direct fields (not operators)
    for (const [key, val] of Object.entries(update)) {
      if (!key.startsWith('$')) {
        flatUpdate[key] = val;
      }
    }
    flatUpdate.updatedAt = new Date();

    await docRef.update(flatUpdate);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return docToUser(doc.id, doc.data()!);
  },

  async findByIdAndDelete(id: string): Promise<any | null> {
    if (!id) return null;
    const docRef = collections.users().doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    const user = docToUser(doc.id, doc.data()!);
    await docRef.delete();
    return user;
  },

  // Helper for auth routes that need passwordHash/refreshToken
  // (In Mongoose these were select: false — Firestore doesn't hide fields)
  findOneWithSecrets(query: Record<string, any>) {
    return this.findOne(query);
  },
};
