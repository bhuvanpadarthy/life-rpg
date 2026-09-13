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
  return 'cyberpunk_life_rpg_super_secret_jwt_key_2026';
}
