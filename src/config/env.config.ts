import { envSchema } from '@/config/schema';
import { registerAs } from '@nestjs/config';

export const envConfig = registerAs('env', () => {
  const data = envSchema.parse(process.env);
  return data;
});
