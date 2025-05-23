import { Types } from "mongoose";
import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface RentInterface {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  start: Date;
  end: Date;
  vehicle: VehicleInterface;  
  pickupLocation: string;
  dropoffLocation: string;
  user: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled' | 'active' | 'completed';
  total: number;

  referralCode: string | null;
  useCredits: boolean;

  appliedDiscounts: { 
    referral: number;
    creditsUsed: number;
  };

  paymentSessionId?: string;
}


export interface RentForCreate {
  start: Date;
  end: Date;
  vehicle: VehicleInterface;  
  pickupLocation: string;
  dropoffLocation: string;
  user: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled' | 'active' | 'completed';
  total: number;

  referralCode: string | null;
  useCredits: boolean;

  appliedDiscounts: { 
    referral: number;
    creditsUsed: number;
  };
  
  paymentSessionId?: string;
}

export type RentInterfaceWithoutUser = Omit<RentInterface, 'user'>;
