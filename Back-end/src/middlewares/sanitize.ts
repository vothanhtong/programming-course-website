import { Request, Response, NextFunction } from 'express';

export const sanitizeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (obj: unknown): unknown => {
    // BUG-14 FIX: Xử lý arrays đệ quy trước khi xử lý objects
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
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

  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) {
        (req.query as Record<string, unknown>)[key] = undefined;
      } else {
        const val = req.query[key];
        if (typeof val === 'string' && (val.startsWith('{') || val.includes('$'))) {
          (req.query as Record<string, unknown>)[key] = val.replace(/\$/g, '');
        }
      }
    }
  }

  next();
};
