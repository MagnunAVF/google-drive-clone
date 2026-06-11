import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'PORT') {
                return 3000;
              }
              if (key === 'DATABASE_HOST') {
                return 'localhost';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a JSON object with environment details', () => {
      expect(appController.getHello()).toEqual({
        environment: 'test',
        port: 3000,
        databaseHost: 'localhost',
      });
    });
  });
});
