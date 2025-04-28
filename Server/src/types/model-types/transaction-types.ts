import { Types } from "mongoose";
import { UserFromDB } from "./user-types";
import { RentInterface } from "./rent-types";
import { CompanyInterface } from "./company-types";

export interface TransactionInterface {
  user: UserFromDB;
  total: number;
  rent: RentInterface;
  company: CompanyInterface;
  status: 'success' | 'failed' | 'expired',
  type: string; // withdrawal | payment

  created_at: Date;
  updated_at: Date;
  _id: Types.ObjectId;
}

export interface TransactionCreateInterface {
  user: Types.ObjectId;
  total: number;
  rent: Types.ObjectId;
  company: CompanyInterface;
  status: 'success' | 'failed' | 'expired',
  type: string; // withdrawal | payment


}