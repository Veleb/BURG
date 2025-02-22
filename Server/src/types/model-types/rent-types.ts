import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface RentInterface {
  _id?: string;
  start: Date;
  end: Date;
  vehicle: VehicleInterface;  
  location: string;
  user: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled';
}

export interface RentInterfaceWithoutUser {
  start: Date;
  end: Date;
  location: string;
  vehicle: VehicleInterface;
}
