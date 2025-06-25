import { Schema, model, Types } from "mongoose";
import { TransactionInterface } from "../types/model-types/transaction-types";

const TransactionSchema = new Schema<TransactionInterface>({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  rent: {
    type: Types.ObjectId,
    ref: "Rent",
    required: true,
  },
  company: {
    type: Types.ObjectId,
    ref: "Company",
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  merchantOrderId: {
    type: String,
    required: true,
  },
  refundId: {
    type: String,
    required: false,
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const TransactionModel = model('Transaction', TransactionSchema, 'transactions');

export default TransactionModel;
