import { Types } from "mongoose";

export interface CertificateInterface {
  _id: Types.ObjectId,
  created_at: Date,
  updated_at: Date,
  redeemed_at: Date,

  isRedeemed: boolean,
  user: Types.ObjectId | undefined
  
  code: string,
  
  issuedTo: string,
  downloadLink: string,
  position: string,
}

export interface CertificateForCreate {
  code: string,
  downloadLink: string,
  issuedTo: string,
  position: string,
  isRedeemed: boolean,
  redeemed_at: Date,
  user?: Types.ObjectId,
}

export interface CertificateForPDF {
    issuedTo: string;
    position: string;
    code: string;
    date: string;
}