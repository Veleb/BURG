import { Types } from "mongoose";
import TransactionModel from "../models/transactions";
import UserModel from "../models/user";
import { TransactionInterface } from "../types/model-types/transaction-types";
import rentService from "./rentService";
import CompanyModel from "../models/company";

const getAllTransactions = async () => {
  const transactions = await TransactionModel.find()
    .populate({
      path: 'user',
      select: '-password',
    })
    .populate("rent")
    .populate("company")
    .lean();

  if (!transactions || transactions.length === 0) {
    throw new Error("No transactions found.");
  }

  return transactions;
}

const getCompanyTransactions = async (companyId: Types.ObjectId) => {
  const companyTransactions = await TransactionModel.find({ company: companyId })
    .populate({
      path: 'user',
      select: '-password',
    })
    .populate("rent")
    .populate("company")
    .lean();
  
  if (!companyTransactions || companyTransactions.length === 0) {
    throw new Error("No transactions found for this company.");
  }

  return companyTransactions;
}

const getTransactionById = async (transactionId: Types.ObjectId) => {
  const transaction = await TransactionModel.findById(transactionId)  
    .populate({
      path: 'user',
      select: '-password',
    })
    .populate("rent")
    .populate("company")
    .lean();

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  return transaction;
}

const createTransaction = async (
  userId: Types.ObjectId,
  rentalId: Types.ObjectId,
  status: string,
  total: number
): Promise<TransactionInterface> => {

  const rent = await rentService.getRentById(rentalId);
  
  if (!rent) {
    throw new Error("Rent not found");
  }

  const transaction = await TransactionModel.create({
    user: userId,
    rent: rentalId,
    company: rent.vehicle.company._id,
    total,
    status,
  });

  if (!transaction) {
    throw new Error("Error occurred while creating transaction");
  }

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { $push: { transactions: transaction._id } },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found while updating transactions");
  }

  const updatedCompany = await CompanyModel.findByIdAndUpdate(
    rent.vehicle.company._id,
    { $push: { transactions: transaction._id } },
    { new: true }
  );

  if (!updatedCompany) {
    throw new Error("Company not found while updating transactions");
  }

  return transaction;
};

const TransactionService = {
  getAllTransactions,
  createTransaction,
  getCompanyTransactions,
  getTransactionById
}

export default TransactionService;