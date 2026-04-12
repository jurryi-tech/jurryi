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

app.use(cors({
  origin: env.nodeEnv === 'production'
    ? [env.clientUrl || 'https://legalsahay.com'].filter(Boolean)
    : '*',
  credentials: true,
}));
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

connectDB()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`LegalSahay server running on port ${env.port} [${env.nodeEnv}]`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
