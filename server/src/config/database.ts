/**
 * Google Cloud Firestore Database Configuration
 * On Cloud Run, authentication happens automatically via the service account.
 * Locally, use GOOGLE_APPLICATION_CREDENTIALS env var.
 */

import { Firestore } from '@google-cloud/firestore';
import { env } from './env';

let db: Firestore;

export function getDb(): Firestore {
  if (!db) {
    db = new Firestore({
      projectId: env.gcpProjectId || undefined,
    });
  }
  return db;
}

export async function connectDB(): Promise<void> {
  try {
    const firestore = getDb();
    // Test the connection by listing collections
    await firestore.listCollections();
    console.log('Connected to Google Cloud Firestore');
  } catch (error: any) {
    console.error('Firestore connection failed:', error.message);
  }
}

// Collection references
export const collections = {
  users: () => getDb().collection('users'),
  conversations: () => getDb().collection('conversations'),
  messages: () => getDb().collection('messages'),
};
