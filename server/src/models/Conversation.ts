/**
 * Conversation Model
 *
 * Represents a chat conversation between a user and the LegalSahay assistant.
 * Tracks the conversation's category, jurisdiction details, status, and
 * any legal context extracted during the conversation.
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJurisdiction {
  state?: string;
  district?: string;
  courtType?: string;
}

export interface IExtractedContext {
  sections: string[];
  acts: string[];
  documentTypesNeeded: string[];
  keyFacts: string[];
}

export interface IConversation extends Document {
  userId: Types.ObjectId;
  title: string;
  category: string;
  jurisdiction: IJurisdiction;
  status: 'active' | 'resolved' | 'archived';
  summary: string;
  extractedContext: IExtractedContext;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    category: {
      type: String,
      default: '',
    },
    jurisdiction: {
      state: { type: String, default: '' },
      district: { type: String, default: '' },
      courtType: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'archived'],
      default: 'active',
    },
    summary: {
      type: String,
      default: '',
    },
    extractedContext: {
      sections: [{ type: String }],
      acts: [{ type: String }],
      documentTypesNeeded: [{ type: String }],
      keyFacts: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
