import { keys as marketplace } from './keys';
import { createEnv } from '@t3-oss/env-nextjs';

// Next.js automatically loads environment files based on NODE_ENV:
// - .env.development.local (when NODE_ENV=development)
// - .env.production.local (when NODE_ENV=production)
// - .env.local (always loaded, highest priority)
// No custom loading needed - Next.js handles it automatically

export const env = createEnv({
  extends: [marketplace()],
  runtimeEnv: process.env,
});
