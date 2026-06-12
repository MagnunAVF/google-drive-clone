import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

const mockUser = {
  id: '1',
  email: 'user@example.com',
  password: 'hashed-password',
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('returns the user without the password field when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.email, 'password123');

      expect(result).toEqual({ id: '1', email: 'user@example.com' });
      expect(result).not.toHaveProperty('password');
    });

    it('returns null when the password does not match', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(mockUser.email, 'wrong-password');

      expect(result).toBeNull();
    });

    it('returns null when the user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      const result = await service.validateUser('unknown@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('does not call bcrypt when the user is not found', async () => {
      usersService.findByEmail.mockResolvedValue(undefined);

      await service.validateUser('unknown@example.com', 'password123');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns an object with access_token', async () => {
      jwtService.sign.mockReturnValue('signed-jwt');

      const result = await service.login({ id: '1', email: 'user@example.com' });

      expect(result).toEqual({ access_token: 'signed-jwt' });
    });

    it('signs the token with sub and email in the payload', async () => {
      jwtService.sign.mockReturnValue('signed-jwt');

      await service.login({ id: '1', email: 'user@example.com' });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        email: 'user@example.com',
      });
    });
  });
});
