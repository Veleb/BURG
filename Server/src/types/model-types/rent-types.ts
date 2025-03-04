import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface RentInterface {
  _id?: string;
  start: Date;
  end: Date;
  vehicle: VehicleInterface;  
  pickupLocation: string;
  dropoffLocation: string;
  user: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled';
}

export type RentInterfaceWithoutUser = Omit<RentInterface, 'user'>;
