import request from 'supertest';
import app from './helpers/app';

describe('Auth Endpoints', () => {
  const testUser = {
    phone: '9876543210',
    password: 'Test@1234',
    fullName: 'Test User',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.phone).toBe(testUser.phone);
      expect(res.body.user.fullName).toBe(testUser.fullName);
    });

    it('should reject duplicate phone', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(409);
    });

    it('should reject invalid phone format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, phone: '1234' });
      expect(res.status).toBe(400);
    });

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, phone: '9876543211', password: '123' });
      expect(res.status).toBe(400);
    });

    it('should reject missing fullName', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ phone: '9876543212', password: 'Test@1234' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: testUser.phone, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.phone).toBe(testUser.phone);
      expect(res.body.user.fullName).toBe(testUser.fullName);
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: testUser.phone, password: 'WrongPass123' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject non-existent phone', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ phone: '9000000000', password: 'Test@1234' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const registerRes = await request(app).post('/api/auth/register').send(testUser);
      refreshToken = registerRes.body.refreshToken;
    });

    it('should return new access token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token-here' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject empty refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: '' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken: string;

    beforeEach(async () => {
      const registerRes = await request(app).post('/api/auth/register').send(testUser);
      accessToken = registerRes.body.accessToken;
    });

    it('should clear refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should reject logout without auth token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });

  describe('Protected routes', () => {
    it('should reject request without token', async () => {
      const res = await request(app).get('/api/user/profile');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('should accept request with valid token', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(testUser);
      const { accessToken } = registerRes.body;

      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });
  });
});
