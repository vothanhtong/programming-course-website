import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: Error & { status?: number }, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`, { stack: err.stack });
  
  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || 500;
  
  res.status(status).json({
    message: (isProd && status >= 500) ? 'Lỗi hệ thống' : err.message,
    ...(isProd ? {} : { stack: err.stack })
  });
};
