import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface RentInterface {
  start: Date;
  end: Date;
  vehicle: VehicleInterface;
  user: UserFromDB;
  status: "confirmed" | "canceled" | "pending";
  _id: string;
}