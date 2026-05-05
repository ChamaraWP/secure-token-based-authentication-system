import { Test, TestingModule } from '@nestjs/testing';
import { AuthTokenController } from './auth-token.controller';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenController', () => {
  let controller: AuthTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthTokenController],
      providers: [AuthTokenService],
    }).compile();

    controller = module.get<AuthTokenController>(AuthTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
