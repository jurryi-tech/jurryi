/**
 * Test App Helper
 *
 * Creates an Express app configured identically to the production app
 * but without starting a server or connecting to a real database.
 * Used by test suites with supertest.
 */

import express from 'express';
import cors from 'cors';
import authRoutes from '../../src/routes/auth';
import userRoutes from '../../src/routes/user';
import chatRoutes from '../../src/routes/chat';
import { authenticateToken } from '../../src/middleware/auth';
import { errorHandler } from '../../src/middleware/errorHandler';

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

app.use(errorHandler);

export default app;
