import { TransactionInterface } from "./transaction-types";
import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  vehicles: number;
  owner: string;
  status: 'pending' | 'confirmed' | 'canceled';
  carsAvailable: VehicleInterface[],
  totalEarnings: number,
  transactions: TransactionInterface[],

  companyType: string;
  stateRegistration: string;

}