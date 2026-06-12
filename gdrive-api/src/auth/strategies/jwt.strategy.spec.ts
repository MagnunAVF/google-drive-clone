import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('returns user_id and email from the JWT payload', async () => {
      const payload = { sub: '1', email: 'user@example.com' };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ user_id: '1', email: 'user@example.com' });
    });

    it('maps sub to user_id', async () => {
      const payload = { sub: '42', email: 'other@example.com' };

      const result = await strategy.validate(payload);

      expect(result.user_id).toBe('42');
    });
  });
});
