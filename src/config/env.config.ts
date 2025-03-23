import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  environment: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  client_url: process.env.CLIENT_URL,
};
