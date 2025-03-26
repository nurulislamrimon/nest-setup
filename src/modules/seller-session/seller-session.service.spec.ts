import { Test, TestingModule } from '@nestjs/testing';
import { SellerSessionService } from './seller-session.service';

describe('SellerSessionService', () => {
  let service: SellerSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SellerSessionService],
    }).compile();

    service = module.get<SellerSessionService>(SellerSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
