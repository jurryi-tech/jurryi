import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/database';
import { env } from './config/env';
import { authenticateToken } from './middleware/auth';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import chatRoutes from './routes/chat';

const app = express();

// Cloud Run sits behind a load balancer — trust proxy for rate limiting
app.set('trust proxy', true);

// Mobile apps don't have a fixed origin — allow all
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', authenticateToken, userRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);

app.use(errorHandler);

// Start server — connect to DB but don't crash if DB is unavailable yet
const port = parseInt(process.env.PORT || String(env.port), 10);

app.listen(port, () => {
  console.log(`Jurryi server running on port ${port} [${env.nodeEnv}]`);
  connectDB().catch((error) => {
    console.error('Firestore connection failed (will retry on requests):', error.message);
  });
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
