import { Test, TestingModule } from '@nestjs/testing';
import { SellerSessionController } from './seller-session.controller';
import { SellerSessionService } from './seller-session.service';

describe('SellerSessionController', () => {
  let controller: SellerSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SellerSessionController],
      providers: [SellerSessionService],
    }).compile();

    controller = module.get<SellerSessionController>(SellerSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
