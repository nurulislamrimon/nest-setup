import { Module } from '@nestjs/common';
import { AdministratorService } from './administrator.service';
import { AdministratorController } from './administrator.controller';
import { AdministratorSessionService } from '../administrator-session/administrator-session.service';

@Module({
  controllers: [AdministratorController],
  providers: [AdministratorService, AdministratorSessionService],
})
export class AdministratorModule {}
