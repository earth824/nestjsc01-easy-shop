import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().min(0).max(65535),
  BASE_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number().min(0).max(65535),
  SMTP_USERNAME: z.string(),
  SMTP_PASSWORD: z.string(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES: z.coerce.number().positive().int(),
  TTL_MS: z.coerce.number().positive().int(),
  TTL_LIMIT: z.coerce.number().positive().int(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string()
});

export function validateEnv(config: unknown) {
  const { data, success, error } = envSchema.safeParse(config);
  if (!success) {
    console.log('Env validation error: ', error.issues);
    throw new Error('Environment variable validation failed');
  }

  return data;
}
