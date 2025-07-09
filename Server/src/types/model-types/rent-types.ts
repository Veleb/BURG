import { Types } from "mongoose";
import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";
import { locationInterface } from "./interfaces";

export interface RentInterface {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  start: Date;
  end: Date;
  vehicle: VehicleInterface;  
  pickupLocation: locationInterface;
  dropoffLocation: locationInterface;
  user: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled' | 'active' | 'completed' | 'refunded' | 'failed';
  total: number;

  
  referralCode: string | null;
  useCredits: boolean;

  appliedDiscounts: { 
    referral: number;
    creditsUsed: number;
  };
  
  // paymentSessionId?: string;
  receiptUrl?: string;
  orderId: string;
}


export interface RentForCreate {
  start: Date;
  end: Date;
  vehicle: VehicleInterface;  
  pickupLocation: locationInterface;
  dropoffLocation: locationInterface;
  user: UserFromDB;
  status: 'pending' | 'confirmed' | 'canceled' | 'active' | 'completed' | 'refunded' | 'failed';
  total: number;

  referralCode: string | null;
  useCredits: boolean;

  appliedDiscounts: { 
    referral: number;
    creditsUsed: number;
  };
  
  // paymentSessionId?: string;
  orderId: string;
}

export type RentInterfaceWithoutUser = Omit<RentInterface, 'user'>;
