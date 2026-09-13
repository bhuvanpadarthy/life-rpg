import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

export const appConfig = {
  isProduction,
  databaseUrl: process.env.DATABASE_URL?.trim() || '',
};

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;
  if (appConfig.isProduction) {
    throw new Error('JWT_SECRET is required in production. Add it to the Vercel project environment variables.');
  }
  return 'cyberpunk_life_rpg_dev_only_secret_change_me';
}
