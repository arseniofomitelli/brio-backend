import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { config } from './config/config';
import { connectDB } from './config/database';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Initialize models associations
import './models';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving images cross-origin
  })
);

app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, message: 'Слишком много запросов. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Auth routes get a stricter limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Слишком много попыток входа. Попробуйте через 15 минут.' },
});
app.use(`${config.apiPrefix}/auth`, authLimiter);

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env !== 'test') {
  app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(
  '/uploads',
  express.static(path.resolve(config.upload.path), {
    maxAge: '7d',
    etag: true,
  })
);

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Brio Cafe API Docs',
    customCss: '.swagger-ui .topbar { background-color: #8B4513; }',
    swaggerOptions: { persistAuthorization: true },
  })
);

app.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerSpec);
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Brio Cafe API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(config.apiPrefix, routes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(config.port, () => {
    logger.info(`🚀 Brio Cafe API запущен на порту ${config.port}`);
    logger.info(`📚 Swagger: http://localhost:${config.port}/docs`);
    logger.info(`🔍 Health:  http://localhost:${config.port}/health`);
    logger.info(`🌍 API:     http://localhost:${config.port}${config.apiPrefix}`);
  });
};

if (require.main === module) {
  startServer().catch((err) => {
    logger.error('Ошибка запуска сервера:', err);
    process.exit(1);
  });
}

export default app;
