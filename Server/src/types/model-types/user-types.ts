import { RentInterface } from "./rent-types";
import { VehicleInterface } from "./vehicle-types";

export interface UserInterface {
  fullName: string
  email: string;
  phoneNumber?: string;
  password: string;
  rents: RentInterface[];
  likes: string[] | VehicleInterface[];
  role: { type: String, enum: ["user", "admin"], default: "user" },
  
  _id: string;
  created_at: Date;
  updated_at: Date;
}

export interface userForLogin {
  password: string;
  email: string;
}

export interface UserForAuth {
  fullName: string
  email: string;
  phoneNumber?: string;
  password: string;
}

export interface UserFromDB {
  _id: string;
  
  fullName: string
  email: string;
  phoneNumber?: string;

  rents: RentInterface[];
  likes: string[] | VehicleInterface[];

  created_at: Date;
  updated_at: Date;
}