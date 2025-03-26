import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';
import { AdministratorSessionService } from '../administrator-session/administrator-session.service';
import { CloudflareService } from 'src/lib/cloudflare.service';

@Module({
  controllers: [AdministratorController],
  providers: [
    AdministratorService,
    AdministratorSessionService,
    CloudflareService,
  ],
  exports: [CloudflareService],
})
export class AdministratorModule {}
