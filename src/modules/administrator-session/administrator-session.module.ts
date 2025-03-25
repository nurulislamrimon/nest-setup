import { Module } from '@nestjs/common';
import { AdministratorSessionService } from './administrator-session.service';
import { AdministratorSessionController } from './administrator-session.controller';

@Module({
  controllers: [AdministratorSessionController],
  providers: [AdministratorSessionService],
  exports: [AdministratorSessionService],
})
export class AdministratorSessionModule {}
