import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    const conn = await mongoose.connect(env.mongodbUri);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB reconnected successfully.');
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Database] Failed to connect to MongoDB: ${message}`);
    throw error;
  }
}
