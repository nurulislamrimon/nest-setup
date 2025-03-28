import {
  Controller,
  Get,
  Param,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { emailRegex } from 'src/utils/validators.utils';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test/:email')
  async sendMail(@Param('email') email: string) {
    if (!email) {
      throw new NotFoundException('Email is required!');
    }

    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email!');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await this.mailService.sendMail({
      to: email,
      subject: 'The new SMTP setup',
      text: 'This is text from new SMTP',
    });
  }
}
