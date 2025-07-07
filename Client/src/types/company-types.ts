import { TransactionInterface } from "./transaction-types";
import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  _id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  slug: string;
  email: string;
  phoneNumber: string;
  location: string;
  vehicles: number;
  owner: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled' | "hold" | "banned";
  carsAvailable: VehicleInterface[],
  totalEarnings: number,
  transactions: TransactionInterface[],

  companyType: string;
  stateRegistration: string;
  registrationImages: string[];
  isPromoted: boolean;

}