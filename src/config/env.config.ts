import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  environment: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  local_db_url: process.env.LOCAL_DB_URL,
  prod_db_url: process.env.PROD_DB_URL,
  client_url: process.env.CLIENT_URL,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET || 'expert-secret',
  access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN || '1d',

  // optional
  db_password: process.env.DB_PASSWORD,
};
