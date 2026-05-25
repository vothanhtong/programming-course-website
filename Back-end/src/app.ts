import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import logger from './config/logger';
import { MAX_SIZE_JSON_REQUEST } from './constants';
import routes from './routes';
import { globalLimiter } from './middlewares/rateLimiter';
import { sanitizeMiddleware } from './middlewares/sanitize';
import { errorHandler } from './middlewares/error';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

app.use(cookieParser());
app.use(compression());

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:', 'http://localhost:5001', 'http://localhost:8080', 'http://localhost:3001'],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(sanitizeMiddleware);

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

app.use(globalLimiter);

app.use(express.json({ limit: MAX_SIZE_JSON_REQUEST }));
app.use(express.urlencoded({ extended: true, limit: MAX_SIZE_JSON_REQUEST }));

app.use(morgan(isProd ? 'combined' : 'dev', {
  stream: { write: (msg: string) => logger.http(msg.trim()) },
}));
if (isProd) app.disable('x-powered-by');

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '7d',
  etag: true,
}));

app.use('/apis', routes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

if (isProd) {
  app.use(express.static(path.join(__dirname, '../../public')));
  app.get('*', (_req: Request, res: Response) =>
    res.sendFile(path.join(__dirname, '../../public', 'index.html'))
  );
}

app.use(errorHandler);

export default app;
