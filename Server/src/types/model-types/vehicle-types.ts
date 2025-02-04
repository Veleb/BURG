import { CompanyInterface } from "./company-types";
import { Category, Size } from "./enums";
import { RentInterface } from "./rent-types";

export interface VehicleInterface {
  name: string;
  model: string;
  capacity: number;
  company: CompanyInterface;
  size: Size;
  category: Category;
  images: string[];
  reserved: string[] | RentInterface[];
  pricePerDay: number;
  pricePerKm: number;
  available: boolean;

  _id: string;
  created_at: Date;
  updated_at: Date;
}