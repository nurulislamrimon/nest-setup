import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  environment: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  client_url: process.env.CLIENT_URL,

  // access token
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || 'expert-secret',
  access_token_expires_in:
    (process.env.ACCESS_TOKEN_EXPIRES_IN as number | undefined) ||
    1 * 24 * 60 * 60,

  // cloudflare
  cloudflare_bucket_name:
    process.env.CLOUDFLARE_BUCKET_NAME || 'bd_entrepreneur',
  cloudflare_r2_endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  cloudflare_r2_access_key: process.env.CLOUDFLARE_R2_ACCESS_KEY || '',
  cloudflare_r2_secret_key: process.env.CLOUDFLARE_R2_SECRET_KEY || '',

  // mail config
  mail_from: process.env.MAIL_FROM,
  mail_host: process.env.MAIL_HOST,
  mail_port: process.env.MAIL_PORT || 465,
  mail_user: process.env.MAIL_USER,
  mail_password: process.env.MAIL_PASSWORD,
};
