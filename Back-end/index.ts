import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import mongoose from 'mongoose';
import dns from 'dns';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import logger from './src/configs/logger';
import { MAX_SIZE_JSON_REQUEST } from './src/constants';
import courseApi   from './src/apis/course.api';
import categoryApi from './src/apis/category.api';
import adminApi    from './src/apis/admin.api';
import authApi     from './src/apis/auth.api';
import uploadApi   from './src/apis/upload.api';
import messageApi  from './src/apis/message.api';

const app    = express();
const PORT   = parseInt(process.env.PORT || '5001', 10);
const isProd = process.env.NODE_ENV === 'production';

// ── Compression ───────────────────────────────────────────
app.use(compression());

// ── Security headers ──────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      // Cho phép load ảnh từ localhost (dev) và https (prod)
      imgSrc:     ["'self'", 'data:', 'https:', 'http://localhost:5001', 'http://localhost:8080', 'http://localhost:3001'],
      connectSrc: ["'self'"],
    },
  },
}));

// ── NoSQL injection protection ────────────────────────────
// express-mongo-sanitize không tương thích với Express 5 (req.query là getter-only)
// Thay bằng middleware thủ công strip ký tự $ và . khỏi body/params
app.use((req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: unknown): unknown => {
    if (obj && typeof obj === 'object') {
      for (const key of Object.keys(obj as Record<string, unknown>)) {
        if (key.startsWith('$') || key.includes('.')) {
          delete (obj as Record<string, unknown>)[key];
        } else {
          (obj as Record<string, unknown>)[key] = sanitize((obj as Record<string, unknown>)[key]);
        }
      }
    }
    return obj;
  };
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
});

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3001',
  'http://localhost:3002',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// ── Rate limiting ─────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { message: 'Quá nhiều lần thử đăng nhập. Thử lại sau 15 phút.' },
  standardHeaders: 'draft-7', legacyHeaders: false, skipSuccessfulRequests: true,
});

const enrollLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 20,
  message: { message: 'Quá nhiều yêu cầu đăng ký. Thử lại sau.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { message: 'Quá nhiều tin nhắn. Vui lòng thử lại sau.' },
  standardHeaders: 'draft-7', legacyHeaders: false,
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 500,
  standardHeaders: 'draft-7', legacyHeaders: false,
});

app.use(globalLimiter);

// ── Body parsing ──────────────────────────────────────────
app.use(express.json({ limit: MAX_SIZE_JSON_REQUEST }));
app.use(express.urlencoded({ extended: true, limit: MAX_SIZE_JSON_REQUEST }));

// ── Logging ───────────────────────────────────────────────
app.use(morgan(isProd ? 'combined' : 'dev', {
  stream: { write: (msg: string) => logger.http(msg.trim()) },
}));
if (isProd) app.disable('x-powered-by');

// ── MongoDB ───────────────────────────────────────────────
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

mongoose.connect(process.env.MONGO_URL as string, {
  serverSelectionTimeoutMS: 10000,
  family: 4,
})
  .then(() => logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`))
  .catch((err: Error) => {
    logger.error(`❌ MongoDB failed: ${err.message}`);
    logger.warn('   → Vào MongoDB Atlas > Network Access > Add 0.0.0.0/0');
  });

mongoose.connection.on('disconnected', () => logger.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected',  () => logger.info('✅ MongoDB reconnected'));

// ── Static: serve uploaded images ────────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

// ── Routes ────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => res.json({
  status: 'ok',
  server: 'High Sky | Sky Growth API',
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  time: new Date().toISOString(),
}));

app.use('/apis/admin/login',    authLimiter);
app.use('/apis/courses/enroll', enrollLimiter);
app.use('/apis/messages',       messageLimiter);

app.use('/apis/courses',    courseApi);
app.use('/apis/categories', categoryApi);
app.use('/apis/admin',      adminApi);
app.use('/apis/auth',       authApi);
app.use('/apis/upload',     uploadApi);
app.use('/apis/messages',   messageApi);

// Production: serve frontend build
if (isProd) {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (_req: Request, res: Response) =>
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  );
}

// ── Global error handler ──────────────────────────────────
app.use((err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`);
  res.status(err.status || 500).json({
    message: isProd ? 'Lỗi server' : err.message,
  });
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info('═'.repeat(50));
  logger.info('  🚀 HIGH SKY | SKY GROWTH - API Server');
  logger.info('═'.repeat(50));
  logger.info(`  ✅ Server  : http://localhost:${PORT}`);
  logger.info(`  ❤️  Health  : http://localhost:${PORT}/health`);
  logger.info(`  📚 Courses : http://localhost:${PORT}/apis/courses`);
  logger.info(`  🔐 Admin   : http://localhost:${PORT}/apis/admin/login`);
  logger.info('═'.repeat(50));
});
