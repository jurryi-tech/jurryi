// Mock external services before importing anything that uses them
jest.mock('../src/services/claude', () => ({
  sendToClaude: jest.fn().mockResolvedValue({
    content: 'Test title',
    tokensUsed: { input: 10, output: 5 },
  }),
  streamFromClaude: jest.fn(),
}));

jest.mock('../src/services/tavily', () => ({
  searchLegalInfo: jest.fn().mockResolvedValue([]),
}));

import request from 'supertest';
import mongoose from 'mongoose';
import app from './helpers/app';

describe('Chat Endpoints', () => {
  let accessToken: string;
  let conversationId: string;

  beforeAll(async () => {
    // Register and login a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '9876543210',
        password: 'Test@1234',
        fullName: 'Chat Test User',
      });
    accessToken = registerRes.body.accessToken;
  });

  describe('POST /api/chat/conversations', () => {
    it('should create a new conversation', async () => {
      const res = await request(app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Property Dispute Query', category: 'property_dispute' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('conversation');
      expect(res.body.conversation).toHaveProperty('_id');
      expect(res.body.conversation.title).toBe('Property Dispute Query');
      expect(res.body.conversation.category).toBe('property_dispute');
      expect(res.body.conversation.status).toBe('active');

      conversationId = res.body.conversation._id;
    });

    it('should create conversation with default title', async () => {
      const res = await request(app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(201);
      expect(res.body.conversation.title).toBe('New Conversation');
    });

    it('should reject without auth', async () => {
      const res = await request(app)
        .post('/api/chat/conversations')
        .send({ title: 'Unauthorized' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/chat/conversations', () => {
    it('should list user conversations', async () => {
      const res = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('conversations');
      expect(Array.isArray(res.body.conversations)).toBe(true);
      expect(res.body.conversations.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/chat/conversations');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/chat/conversations/:id', () => {
    it('should get conversation with messages', async () => {
      const res = await request(app)
        .get(`/api/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('conversation');
      expect(res.body).toHaveProperty('messages');
      expect(res.body.conversation._id).toBe(conversationId);
      expect(Array.isArray(res.body.messages)).toBe(true);
    });

    it('should 404 for non-existent id', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/chat/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject without auth', async () => {
      const res = await request(app).get(`/api/chat/conversations/${conversationId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/chat/conversations/:id', () => {
    it('should update conversation title', async () => {
      const res = await request(app)
        .patch(`/api/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.conversation.title).toBe('Updated Title');
    });

    it('should update conversation status', async () => {
      const res = await request(app)
        .patch(`/api/chat/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'resolved' });

      expect(res.status).toBe(200);
      expect(res.body.conversation.status).toBe('resolved');
    });

    it('should 404 for non-existent conversation', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .patch(`/api/chat/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Ghost' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/chat/conversations/:id', () => {
    let deleteConvId: string;

    beforeEach(async () => {
      const createRes = await request(app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'To Be Deleted' });
      deleteConvId = createRes.body.conversation._id;
    });

    it('should delete conversation and messages', async () => {
      const res = await request(app)
        .delete(`/api/chat/conversations/${deleteConvId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Conversation deleted successfully.');

      // Verify it is truly gone
      const getRes = await request(app)
        .get(`/api/chat/conversations/${deleteConvId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(getRes.status).toBe(404);
    });

    it('should 404 when deleting non-existent conversation', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .delete(`/api/chat/conversations/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });

    it('should reject without auth', async () => {
      const res = await request(app).delete(`/api/chat/conversations/${deleteConvId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/chat/conversations/:id/messages', () => {
    it('should return empty messages for new conversation', async () => {
      const createRes = await request(app)
        .post('/api/chat/conversations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Empty Chat' });
      const convId = createRes.body.conversation._id;

      const res = await request(app)
        .get(`/api/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('messages');
      expect(res.body.messages).toHaveLength(0);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination.total).toBe(0);
    });

    it('should 404 for non-existent conversation', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/chat/conversations/${fakeId}/messages`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
