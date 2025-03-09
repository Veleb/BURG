import { CompanyInterface } from "./company-types";
import { Category, Size } from "./enums";
import { RentInterface } from "./rent-types";

export interface MachineryInterface {

    _id: string;
    company: CompanyInterface | string;
    reserved: string[] | RentInterface[];
    available: boolean;
    details: MachineryDetails;
    likes: string[];
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