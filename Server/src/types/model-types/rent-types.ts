import { Types } from "mongoose";
import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface RentInterface {
  _id: Types.ObjectId;
  start: Date;
  end: Date;
  vehicle: VehicleInterface;  
  pickupLocation: string;
  dropoffLocation: string;
  user: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled';
  total: number;
}

export interface RentForCreate {
  start: Date;
  end: Date;
  vehicle: Types.ObjectId;  
  pickupLocation: string;
  dropoffLocation: string;
  user: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'canceled';
  total: number; 
}

export type RentInterfaceWithoutUser = Omit<RentInterface, 'user'>;
