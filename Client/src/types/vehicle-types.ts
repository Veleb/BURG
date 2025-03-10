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
  model: string;
  name: string;
  year: number;
  type: string;
  size: Size;
  fuelType: string;
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