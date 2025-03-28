import { envConfig } from './env.config';

export const transportConfig = {
  host: envConfig.mail_host,
  port: envConfig.mail_port,
  secure: envConfig.mail_port === 465,
  auth: {
    user: envConfig.mail_user,
    pass: envConfig.mail_password,
  },
};
