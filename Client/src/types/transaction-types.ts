import { CompanyInterface } from "./company-types";
import { RentInterface } from "./rent-types";
import { UserFromDB } from "./user-types";

export interface TransactionInterface {
  user: UserFromDB;
  total: number;
  rent: RentInterface;
  company: CompanyInterface;
  status: 'success' | 'failed' | 'expired' | 'refunded',
  // type: string; // withdrawal | payment
  merchantOrderId: string;
  refundId?: string;
  created_at: Date;
  updated_at: Date;
  _id: string;
}

export interface TransactionCreateInterface {
  user: string;
  total: number;
  rent: string;
  company: CompanyInterface;
  status: 'success' | 'failed' | 'expired' | 'refunded',
  // type: string; // withdrawal | payment
  merchantOrderId: string;
  refundId?: string;
}