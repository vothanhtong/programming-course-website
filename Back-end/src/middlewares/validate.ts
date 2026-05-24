import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errMessage = (error as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        const err: any = new Error(`Validation Error: ${errMessage}`);
        err.status = 400;
        return next(err);
      }
      return next(error);
    }
  };
};
