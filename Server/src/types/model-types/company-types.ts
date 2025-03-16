import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  companyPhoneNumber: string;
  companyName: string;
  companyEmail: string;
  companyLocation?: string;
  numberOfVehicles: number;
  status: 'pending' | 'confirmed' | 'canceled';
  carsAvailable: VehicleInterface[];
  
  _id: string;
}