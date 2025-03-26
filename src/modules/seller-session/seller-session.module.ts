import { Module } from '@nestjs/common';
import { SellerSessionService } from './seller-session.service';
import { SellerSessionController } from './seller-session.controller';

@Module({
  controllers: [SellerSessionController],
  providers: [SellerSessionService],
  exports: [SellerSessionService],
})
export class SellerSessionModule {}
