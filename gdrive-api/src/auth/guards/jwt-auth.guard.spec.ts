import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';

const buildMockContext = (handler = jest.fn(), classRef = jest.fn()) =>
  ({
    getHandler: () => handler,
    getClass: () => classRef,
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ headers: {} }),
    }),
  }) as unknown as ExecutionContext;

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector);
  });

  describe('canActivate', () => {
    it('returns true immediately for routes marked as public', () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(buildMockContext());

      expect(result).toBe(true);
    });

    it('delegates to the JWT AuthGuard for non-public routes', () => {
      reflector.getAllAndOverride.mockReturnValue(false);
      const superSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const context = buildMockContext();
      guard.canActivate(context);

      expect(superSpy).toHaveBeenCalledWith(context);
    });

    it('delegates to the JWT AuthGuard when the public metadata is absent', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const superSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      const context = buildMockContext();
      guard.canActivate(context);

      expect(superSpy).toHaveBeenCalledWith(context);
    });
  });
});
