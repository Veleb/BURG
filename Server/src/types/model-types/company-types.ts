import { Types } from "mongoose";
import { UserInterface } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  carsAvailable?: VehicleInterface[];
  owner: Types.ObjectId | UserInterface;
  status: 'pending' | 'confirmed' | 'canceled';
  totalEarnings: number;
  companyType: string;
  stateRegistration: string;
}

export interface CompanyForCreate {
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  owner: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'canceled';
  totalEarnings: number;
  companyType: string;
  stateRegistration: string;
}