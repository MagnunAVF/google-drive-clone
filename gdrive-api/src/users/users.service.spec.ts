import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('returns the user when the email matches', async () => {
      const user = await service.findByEmail('user@example.com');

      expect(user).toBeDefined();
      expect(user?.id).toBe('1');
      expect(user?.email).toBe('user@example.com');
    });

    it('returns undefined for an unknown email', async () => {
      const user = await service.findByEmail('unknown@example.com');

      expect(user).toBeUndefined();
    });

    it('returns undefined for an empty string', async () => {
      const user = await service.findByEmail('');

      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('returns the user when the id matches', async () => {
      const user = await service.findById('1');

      expect(user).toBeDefined();
      expect(user?.id).toBe('1');
      expect(user?.email).toBe('user@example.com');
    });

    it('returns undefined for an unknown id', async () => {
      const user = await service.findById('999');

      expect(user).toBeUndefined();
    });

    it('returns undefined for an empty string', async () => {
      const user = await service.findById('');

      expect(user).toBeUndefined();
    });
  });

  describe('password storage', () => {
    it('does not store the password as plaintext', async () => {
      const user = await service.findByEmail('user@example.com');

      expect(user?.password).not.toBe('password123');
      expect(user?.password).toMatch(/^\$2b\$/);
    });
  });
});
