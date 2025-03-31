import { Types } from "mongoose";
import { CompanyInterface } from "./company-types";
import { Category, Size } from "./enums";
import { RentInterface } from "./rent-types";

export interface MachineryInterface {

    _id: Types.ObjectId;
    company: CompanyInterface | Types.ObjectId;
    reserved: Types.ObjectId[] | RentInterface[];
    available: boolean;
    details: MachineryDetails;
    likes: Types.ObjectId[];
    created_at: Date;
    updated_at: Date;

}
interface MachineryDetails {
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