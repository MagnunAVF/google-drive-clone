import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('returns 200 and status ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect({ status: 'ok' });
    });
  });

  describe('POST /auth/login', () => {
    it('returns 201 and an access_token with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('returns 401 with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrong' })
        .expect(401);
    });

    it('returns 401 with unknown email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'unknown@example.com', password: 'password123' })
        .expect(401);
    });

    it('returns 401 when body is missing', () => {
      return request(app.getHttpServer()).post('/auth/login').expect(401);
    });
  });

  describe('GET /profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'password123' });

      accessToken = response.body.access_token;
    });

    it('returns 200 and user data with a valid token', () => {
      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect({ user_id: '1', email: 'user@example.com' });
    });

    it('returns 401 when no token is provided', () => {
      return request(app.getHttpServer()).get('/profile').expect(401);
    });

    it('returns 401 with a malformed token', () => {
      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', 'Bearer not.a.valid.token')
        .expect(401);
    });

    it('returns 401 with a token signed by a different secret', () => {
      const foreignToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
        '.eyJzdWIiOiIxIiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIn0' +
        '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${foreignToken}`)
        .expect(401);
    });
  });
});
