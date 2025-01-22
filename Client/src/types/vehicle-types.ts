import { CompanyInterface } from "./company-types";
import { Category, Size } from "./enums";

export interface VehicleInterface {
  name: string;
  model: string;
  capacity: number;
  company: CompanyInterface; // TODO: CHANGE THIS TO COMPANY INTERFACE
  size: Size,
  category: Category,
  images: string[],
  pricePerDay: number,
  available: boolean

  _id: string;
  created_at: Date;
  updated_at: Date;
}