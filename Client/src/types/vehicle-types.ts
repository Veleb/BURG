import { CompanyInterface } from "./company-types";
import { Size } from "./enums";
import { RentInterface } from "./rent-types";

export interface VehicleInterface {
  _id: string;
  company: CompanyInterface;
  reserved: string[] | RentInterface[];
  available: boolean;
  details: VehicleDetails
  likes: string[];

  created_at: Date;
  updated_at: Date;
}

interface VehicleDetails {
  name: string;
  model: string;
  year: number;
  size: Size;
  engine: string;
  power: string;
  gvw: number;
  fuelTank: number;
  tyres: number;
  mileage: number;
  chassisType: string;
  category: string;
  capacity: number;
  pricePerDay: number;
  pricePerKm: number;
  images: string[];
}

export interface FilterState {
  categories: string[];
  year?: number;
  sort: {
    key: 'price' | 'year' | "likes" | 'none';
    direction: 'asc' | 'desc';
  };
}