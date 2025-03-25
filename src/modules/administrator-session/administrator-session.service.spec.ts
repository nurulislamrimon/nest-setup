import { Test, TestingModule } from '@nestjs/testing';
import { AdministratorSessionService } from './administrator-session.service';

describe('AdministratorSessionService', () => {
  let service: AdministratorSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministratorSessionService],
    }).compile();

    service = module.get<AdministratorSessionService>(
      AdministratorSessionService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
