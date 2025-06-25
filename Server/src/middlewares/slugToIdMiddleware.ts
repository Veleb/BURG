import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';
import { HasSlug } from '../types/documentSlug';

function slugToIdMiddleware({
  model,
  slugParam = 'companySlug',
  idParam = 'companyId'
}: {
  model: Model<HasSlug>;
  slugParam?: string;
  idParam?: string;
}) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params[slugParam];

      if (!slug) {
        res.status(400).json({ error: 'Missing slug parameter' });
        return; 
      }

      const doc = await model.findOne({ slug });

      if (!doc) {
        res.status(404).json({ error: `${model.modelName} not found` });
        return; 
      }

      req.params[idParam] = doc._id.toString();

      next();
    } catch (error) {
      next(error);
    }
  };
}

export default slugToIdMiddleware;