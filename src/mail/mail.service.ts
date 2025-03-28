import { BadRequestException, Injectable } from '@nestjs/common';
import { envConfig } from 'src/config/env.config';
import * as nodemailer from 'nodemailer';
import { transportConfig } from 'src/config/mail.config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(
      transportConfig as nodemailer.TransportOptions,
    );
  }

  async sendMail({
    userFrom = '',
    to,
    bcc = '',
    subject,
    text,
    html,
    platformName,
    attachments,
  }: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    bcc?: string | string[];
    userFrom?: string;
    platformName?: string;
    attachments?: { filename: string; path: string }[];
  }) {
    try {
      if (!to.trim()) {
        throw new BadRequestException('Recipient email (to) is required.');
      }
      const from = `${platformName || 'No Reply'} <${userFrom || envConfig.mail_user}>`;

      const info = await this.transporter.sendMail({
        from,
        to,
        bcc,
        subject,
        text,
        html,
        attachments: attachments || [],
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return info;
    } catch (error) {
      console.error('Email sending error:', error);
      throw new BadRequestException('Failed to send email.');
    }
  }
}
