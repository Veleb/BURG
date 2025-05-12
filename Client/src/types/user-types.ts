import { CertificateInterface } from "./certificate-types";
import { CompanyInterface } from "./company-types";
import { TransactionInterface } from "./transaction-types";

export interface UserFromDB {
  fullName: string,
  email: string;
  phoneNumber?: string;
  rents: string[];
  companies: CompanyInterface[] | string[] ;
  role: "user" | "host" | "admin";
  referralCode: string;
  disallowedReferralCodes: string[];
  credits: number;
  transactions: TransactionInterface[],
  certificates: CertificateInterface[],
  
  _id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserForLogin {
  email: string;
  password: string,
}

export interface UserForRegister {
  fullName: string,
  email: string;
  phoneNumber?: string;  
}

export interface UpdateUserCredentials {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UserForPartner {
  fullName: string;
  email: string;
  phone: string;
  vehicles: number;
}