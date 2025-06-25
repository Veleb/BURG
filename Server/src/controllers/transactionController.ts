import { NextFunction, Request, Response, Router } from "express";
import TransactionService from "../services/transactionService";
import { Model, Types } from "mongoose";
import slugToIdMiddleware from "../middlewares/slugToIdMiddleware";
import CompanyModel from "../models/company";
import { HasSlug } from "../types/documentSlug";

const TransactionController = Router();

TransactionController.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const { transactions, totalCount } = await TransactionService.getAllTransactionsPaginated(limit, offset);
    
    res.status(200).json({ transactions, totalCount });
  } catch (err) {
    next(err);
  }
});

TransactionController.get('/company/:companySlug', slugToIdMiddleware({ model: CompanyModel as unknown as Model<HasSlug> }) ,async (req, res, next) => {
  try {
    const companyId = new Types.ObjectId(req.params.companyId);

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const { transactions, totalCount } = await TransactionService.getCompanyTransactionsPaginated(companyId, limit, offset);
    
    res.status(200).json({ transactions, totalCount });
  } catch (err) {
    next(err);
  }
});

TransactionController.get('/:transactionId', async (req: Request, res: Response, next: NextFunction) => {

  const transactionId = new Types.ObjectId(req.params.transactionId);

  try {
   
    const transaction = await TransactionService.getTransactionById(transactionId);

    res.status(200).json(transaction);
  } catch (err) {
    next(err);
  }
})

export default TransactionController;
