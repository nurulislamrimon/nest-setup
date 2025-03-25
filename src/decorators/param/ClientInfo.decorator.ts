/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as UAParser from 'ua-parser-js';

export interface IClientInfo {
  ip: string;
  user_agent: string;
  device: string;
  platform: string;
  browser: string;
}
export const ClientInfo = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IClientInfo => {
    const request = ctx.switchToHttp().getRequest<Request>();
    // ip extraction
    const xForwardedFor = request.headers['x-forwarded-for'];
    const clientIp = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor?.split(',')[0] || ('ip' in request && request.ip) || '';

    // user agent extraction
    const userAgent = request.headers['user-agent'] || '';
    const parser = new UAParser.UAParser(userAgent);
    const result = parser.getResult();

    return {
      ip: clientIp,
      user_agent: userAgent,
      device: result.device.type || 'Unknown',
      platform: result.os.name || 'Unknown',
      browser: result.browser.name || 'Unknown',
    };
  },
);
