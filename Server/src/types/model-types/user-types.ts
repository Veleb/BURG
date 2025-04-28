import { Types } from "mongoose";
import { CompanyInterface } from "./company-types";
import { RentInterface } from "./rent-types";
import { VehicleInterface } from "./vehicle-types";

export interface UserInterface {
  fullName: string
  email: string;
  phoneNumber?: string;
  password: string | null;
  rents: RentInterface[];
  likes: Types.ObjectId[] | VehicleInterface[];
  companies?: CompanyInterface[];
  transactions: Types.ObjectId[];

  isGoogleUser: boolean;
  tokenVersion: number;
  role: "user" | "admin" | "host";
  
  referralCode: string;
  disallowedReferralCodes: string[];
  credits: number;

  _id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

export interface userForLogin {
  password: string;
  email: string;
}

export interface UserForAuth {
  fullName: string
  email: string;
  phoneNumber?: string;
  password?: string;
  isGoogleUser: Boolean;
  tokenVersion?: number;
}

export interface GoogleUser extends Omit<UserForAuth, 'password'> {
  isGoogleUser: true;
  password?: never;
}

export interface RegularUser extends UserForAuth {
  isGoogleUser: false;
  password: string; 
}

export type UserAuthType = GoogleUser | RegularUser;

export interface UserFromDB {
  fullName: string
  email: string;
  phoneNumber?: string;
  rents: RentInterface[];
  likes: Types.ObjectId[] | VehicleInterface[];
  companies?: CompanyInterface[];
  transactions: Types.ObjectId[];

  isGoogleUser: boolean;
  tokenVersion: number;
  role: "user" | "admin" | "host";
  
  referralCode: string;
  disallowedReferralCodes: string[];
  credits: number;
  _id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}