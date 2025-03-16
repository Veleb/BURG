import { UserInterface } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  _id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  location: string;
  numberOfVehicles: number;
  carsAvailable?: VehicleInterface[];
  owner: string | UserInterface;
  status: 'pending' | 'confirmed' | 'canceled';
}