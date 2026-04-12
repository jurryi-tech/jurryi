import mongoose, { Schema, Document, Model } from 'mongoose';

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
  hasExistingLawyer: boolean;
  urgencyLevel?: UrgencyLevel;
  opposingPartyType?: OpposingPartyType;
}

export interface IUser extends Document {
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

const userSchema = new Schema<IUser>(
  {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },
    email: {
      type: String,
      sparse: true,
      default: undefined,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    state: {
      type: String,
      default: '',
    },
    district: {
      type: String,
      default: '',
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'mixed'],
      default: 'en',
    },
    primaryProblemType: {
      type: String,
      enum: [
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
      ],
    },
    problemDescription: {
      type: String,
      default: '',
    },
    profile: {
      age: { type: Number },
      gender: { type: String },
      occupation: { type: String },
      incomeCategory: {
        type: String,
        enum: ['bpl', 'lower', 'middle', 'upper'],
      },
      hasExistingLawyer: {
        type: Boolean,
        default: false,
      },
      urgencyLevel: {
        type: String,
        enum: ['exploring', 'need_soon', 'urgent', 'emergency'],
      },
      opposingPartyType: {
        type: String,
        enum: ['individual', 'company', 'government', 'unknown'],
      },
    },
    refreshToken: {
      type: String,
      select: false,
    },
    conversationCount: {
      type: Number,
      default: 0,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 }, { sparse: true });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
