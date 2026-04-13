import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  anthropicApiKey: string;
  tavilyApiKey: string;
  clientUrl: string;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function buildEnv(): EnvConfig {
  const nodeEnv = getEnvVar('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  const mongodbUri = process.env.MONGODB_URI || '';
  const jwtSecret = process.env.JWT_SECRET || '';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';

  if (isProduction) {
    const missing: string[] = [];
    if (!mongodbUri) missing.push('MONGODB_URI');
    if (!jwtSecret) missing.push('JWT_SECRET');
    if (!jwtRefreshSecret) missing.push('JWT_REFRESH_SECRET');
    if (missing.length > 0) {
      console.warn(`WARNING: Missing env vars in production: ${missing.join(', ')}. Some features will not work.`);
    }
  }

  return {
    port: parseInt(getEnvVar('PORT', '5000'), 10),
    nodeEnv,
    mongodbUri: mongodbUri || 'mongodb://localhost:27017/legalsahay',
    jwtSecret: jwtSecret || 'dev-jwt-secret-do-not-use-in-production',
    jwtRefreshSecret: jwtRefreshSecret || 'dev-jwt-refresh-secret-do-not-use-in-production',
    jwtExpiresIn: getEnvVar('JWT_EXPIRES_IN', '15m'),
    jwtRefreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
    anthropicApiKey: getEnvVar('ANTHROPIC_API_KEY', ''),
    tavilyApiKey: getEnvVar('TAVILY_API_KEY', ''),
    clientUrl: process.env.CLIENT_URL || '',
  };
}

export const env = buildEnv();
