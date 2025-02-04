import { CompanyInterface } from "./company-types";
import { Category, Size } from "./enums";

export interface VehicleInterface {
  name: string;
  model: string;
  capacity: number;
  company: CompanyInterface;
  size: Size,
  category: Category,
  images: string[],
  pricePerDay: number,
  pricePerKm: number,
  available: boolean

  _id: string;
  created_at: Date;
  updated_at: Date;
}