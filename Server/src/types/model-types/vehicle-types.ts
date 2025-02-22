import { CompanyInterface } from "./company-types";
import { Category, Size } from "./enums";
import { RentInterface } from "./rent-types";

export interface VehicleInterface {
  _id: string;
  company: CompanyInterface;
  reserved: string[] | RentInterface[];
  available: boolean;
  details: VehicleDetails;
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
  category: Category;
  capacity: number;
  pricePerDay: number;
  pricePerKm: number;
  images: string[];
}