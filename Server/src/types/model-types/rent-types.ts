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
  referralCode: string | null;
  useCredits: boolean;
  status: 'pending' | 'confirmed' | 'canceled';
  total: number;
  calculatedPrice: number; 
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
  referralCode: string | null;
  useCredits: boolean;
  status: 'pending' | 'confirmed' | 'canceled';
  total: number;
  calculatedPrice: number; 
  appliedDiscounts: { 
    referral: number;
    creditsUsed: number;
  };
}

export type RentInterfaceWithoutUser = Omit<RentInterface, 'user'>;
