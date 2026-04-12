/**
 * Message Model
 *
 * Represents a single message within a conversation. Messages can be from
 * the user, the assistant (AI), or system-generated. Token usage and
 * optional search results (from Tavily) are stored for auditing.
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITokensUsed {
  input: number;
  output: number;
}

export interface ISearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: ITokensUsed;
  searchResults?: ISearchResult[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    tokensUsed: {
      input: { type: Number },
      output: { type: Number },
    },
    searchResults: [
      {
        title: { type: String },
        url: { type: String },
        snippet: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<IMessage>('Message', messageSchema);
