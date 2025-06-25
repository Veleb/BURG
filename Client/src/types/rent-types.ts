import { UserFromDB } from "./user-types";
import { VehicleInterface } from "./vehicle-types";

export interface RentInterface {
  _id: string;
  start: Date;
  end: Date;
  vehicle: string | VehicleInterface;
  user: string | null;
  pickupLocation: string;
  dropoffLocation: string;
  referralCode: string | null;
  useCredits: boolean;
  status: 'pending' | 'confirmed' | 'canceled' | 'active' | 'completed' | 'refunded' | 'failed';
  total: number;
  calculatedPrice: number; 
  appliedDiscounts: { 
    referral: number;
    creditsUsed: number;
  };
  orderId: string;
}

export interface RentForCreate {
  start: Date;
  end: Date;
  vehicle: string;  
  pickupLocation: string;
  dropoffLocation: string;
  user: string | null;
  referralCode: string | null;
  useCredits: boolean;
  status: 'pending' | 'confirmed' | 'canceled' | 'active' | 'completed' | 'refunded' | 'failed';
  total: number;
  calculatedPrice: number; 
  appliedDiscounts: { 
    referral: number;
    creditsUsed: number;
  };
  orderId: string;
}

export interface FilterState {
  status: string;
  sort: {
    key: 'price' | 'startDate' | 'endDate' | 'none';
    direction: 'asc' | 'desc';
  };
  startDate: Date | null;
  endDate: Date | null;
}