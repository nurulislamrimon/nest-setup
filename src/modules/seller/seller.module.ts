import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { SellerSessionService } from '../seller-session/seller-session.service';
import { CloudflareService } from 'src/lib/cloudflare.service';
import { MailService } from 'src/modules/mail/mail.service';

@Module({
  controllers: [SellerController],
  providers: [
    SellerService,
    SellerSessionService,
    CloudflareService,
    MailService,
  ],
  exports: [CloudflareService, MailService],
})
export class SellerModule {}
