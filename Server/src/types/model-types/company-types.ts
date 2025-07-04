import { Types } from "mongoose";
import { UserInterface } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  slug: string;
  email: string;
  phoneNumber: string;
  location: string;

  carsAvailable?: VehicleInterface[];
  transactions: Types.ObjectId[]; 
  owner: Types.ObjectId | UserInterface;
  status: 'pending' | 'confirmed' | 'canceled' | "hold" | "banned";
  totalEarnings: number;
  companyType: string;
  stateRegistration: string;

  isPromoted: boolean;
}

export interface CompanyForCreate {
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  owner: Types.ObjectId;
  transactions: string[]; 
  status: 'pending' | 'confirmed' | 'canceled';
  totalEarnings: number;
  companyType: string;
  stateRegistration: string;
}