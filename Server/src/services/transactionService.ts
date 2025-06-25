import { Types } from "mongoose";
import TransactionModel from "../models/transactions";
import UserModel from "../models/user";
import { TransactionInterface } from "../types/model-types/transaction-types";
import rentService from "./rentService";
import CompanyModel from "../models/company";
import RentModel from "../models/rent";
import { CompanyInterface } from "../types/model-types/company-types";
import { VehicleInterface } from "../types/model-types/vehicle-types";

const adminCompanyId = new Types.ObjectId(process.env.ADMIN_COMPANY_ID);

const getCompanyTransactionsPaginated = async (companyId: Types.ObjectId, limit: number, offset: number) => {
  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find({ company: companyId })
      .populate('user', '-password')
      .populate('rent')
      .populate('company')
      .skip(offset)
      .limit(limit)
      .lean(),
    TransactionModel.countDocuments({ company: companyId }),
  ]);

  return { transactions, totalCount };
};

const getAllTransactionsPaginated = async (limit: number, offset: number) => {
  const [transactions, totalCount] = await Promise.all([
    TransactionModel.find()
      .populate('user', '-password')
      .populate('rent')
      .populate('company')
      .skip(offset)
      .limit(limit)
      .lean(),
    TransactionModel.countDocuments(),
  ]);

  return { transactions, totalCount };
};

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

const markAsRefunded = async (orderId: string): Promise<void> => {

  const rent = await RentModel.findOneAndUpdate(
    { orderId },
    { $set: { status: 'refunded' } },
    { new: true }
  )
  .populate("vehicle")
  .populate("user")
  .populate({
    path: 'vehicle',
    populate: { path: 'company' }
  });

  if (!rent) throw new Error("Rent not found");

  const vehicle: VehicleInterface = rent.vehicle;
  const company: CompanyInterface = vehicle.company as CompanyInterface

  await TransactionModel.findOneAndUpdate(
    { merchantOrderId: rent.orderId },
    { $set: { status: 'refunded' } }
  );

  await CompanyModel.findByIdAndUpdate(
    (company as CompanyInterface)._id,
    { $inc: { totalEarnings: -(rent?.total ?? 0) * 0.90 } },
    { new: true }
  )

  await CompanyModel.findByIdAndUpdate(
    adminCompanyId,
    { $inc: { totalEarnings: -(rent?.total ?? 0) * 0.10 } },
    { new: true }
  )

}

const addRefundIdToTransaction = async (orderId: string, refundId: string): Promise<TransactionInterface> => {
  const updatedTransaction = await TransactionModel.findOneAndUpdate(
    { merchantOrderId: orderId },
    { $set: { refundId: refundId } },
    { new: true }
  ).lean();

  return updatedTransaction as TransactionInterface;
}

const getRefundIdByOrderId = async (orderId: string): Promise<string | null> => {
  const transaction = await TransactionModel.findOne({ merchantOrderId: orderId }).lean();
  return transaction?.refundId || null;
}


const TransactionService = {
  getAllTransactionsPaginated,
  createTransaction,
  getCompanyTransactionsPaginated,
  getTransactionById,
  markAsRefunded,
  addRefundIdToTransaction,
  getRefundIdByOrderId
}

export default TransactionService;