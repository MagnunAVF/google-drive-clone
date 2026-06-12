import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { LocalStrategy } from './local.strategy';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  describe('validate', () => {
    it('returns the user when credentials are valid', async () => {
      const mockUser = { id: '1', email: 'user@example.com' };
      authService.validateUser.mockResolvedValue(mockUser);

      const result = await strategy.validate('user@example.com', 'password123');

      expect(result).toEqual(mockUser);
    });

    it('throws UnauthorizedException when credentials are invalid', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('user@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when the user does not exist', async () => {
      authService.validateUser.mockResolvedValue(null);

      await expect(
        strategy.validate('unknown@example.com', 'password123'),
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
