import { NextFunction, Request, Response, Router } from "express";
import TransactionService from "../services/transactionService";
import { Types } from "mongoose";

const TransactionController = Router();

TransactionController.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const transactions = await TransactionService.getAllTransactions();

    if (!transactions || transactions.length === 0) {
      res.status(404).json({ message: "No transactions found." });
      return;
    }

    res.status(200).json(transactions);
  } catch (err) {
    next(err);
  }
})

TransactionController.get('/company/:companyId', async (req: Request, res: Response, next: NextFunction) => {

  const companyId = new Types.ObjectId(req.params.companyId);

  try {
   
    const transactions = await TransactionService.getCompanyTransactions(companyId);

    res.status(200).json(transactions);
  } catch (err) {
    next(err);
  }
})

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
