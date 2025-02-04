import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface RentInterface {
  start: Date,
  end: Date,
  vehicle: VehicleInterface,
  user: UserFromDB,
  status: 'pending' | 'confirmed' | 'canceled';
}

export interface RentInterfaceWithoutUser {
  start: Date,
  end: Date,
  vehicle: VehicleInterface,
}