import dotenv from 'dotenv';
import { TokenExpiration } from '../constants/index.js';

dotenv.config();

interface EnvConfig {
  // Server
  port: number;
  nodeEnv: string;

  // Database
  mongoUri: string;

  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;

  // CORS
  corsOrigin: string;

  // Pagination
  defaultPageSize: number;
  maxPageSize: number;
}

/**
 * Parse and validate environment variables
 */
const parseEnv = (): EnvConfig => {
  return {
    // Server
    port: parseInt(process.env.PORT || '8000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',

    // Database
    mongoUri: process.env.MONGO_URI || '',

    // JWT
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || TokenExpiration.ACCESS_TOKEN,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || TokenExpiration.REFRESH_TOKEN,

    // CORS
    corsOrigin: process.env.CORS_ORIGIN || '*',

    // Pagination
    defaultPageSize: 10,
    maxPageSize: 100,
  };
};

export const ENV: EnvConfig = parseEnv();

/**
 * Validate required environment variables
 */
export const validateEnv = (): void => {
  const required: Array<keyof EnvConfig> = ['mongoUri', 'jwtSecret'];
  const missing: string[] = [];

  for (const key of required) {
    if (!ENV[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file and ensure these variables are set.`
    );
  }

  console.log('✅ Environment variables validated successfully');
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return ENV.nodeEnv === 'production';
};

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => {
  return ENV.nodeEnv === 'development';
};

/**
 * Check if running in test
 */
export const isTest = (): boolean => {
  return ENV.nodeEnv === 'test';
};
