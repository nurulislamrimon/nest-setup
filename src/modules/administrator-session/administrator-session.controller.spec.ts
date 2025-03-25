import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorSessionController } from './administrator-session.controller';
import { AdministratorSessionService } from './administrator-session.service';

describe('AdministratorSessionController', () => {
  let controller: AdministratorSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministratorSessionController],
      providers: [AdministratorSessionService],
    }).compile();

    controller = module.get<AdministratorSessionController>(
      AdministratorSessionController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
