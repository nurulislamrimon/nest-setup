import { Module } from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';
import { SellerSessionService } from '../seller-session/seller-session.service';
import { CloudflareService } from 'src/lib/cloudflare.service';

@Module({
  controllers: [SellerController],
  providers: [SellerService, SellerSessionService, CloudflareService],
  exports: [CloudflareService],
})
export class SellerModule {}
