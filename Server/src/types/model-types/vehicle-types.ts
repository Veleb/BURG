import { Types } from "mongoose";
import { CompanyInterface } from "./company-types";
import { Category, Size } from "./enums";
import { RentInterface } from "./rent-types";

export interface VehicleInterface {
  _id: Types.ObjectId;
  company: CompanyInterface | Types.ObjectId;
  reserved: Types.ObjectId[] | RentInterface[];
  available: boolean;
  details: VehicleDetails;
  likes: Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}

interface VehicleDetails {
  name: string;
  slug?: string;
  model: string;
  year: number;
  size: Size;
  engine: string;
  power: string;
  gvw: number;
  fuelTank: number;
  tires: number;
  mileage: number;
  chassisType: string;
  identificationNumber: string;
  category: Category;
  capacity: number;
  pricePerDay: number;
  pricePerKm: number;
  isPromoted: boolean;
  images: string[];
  vehicleRegistration: string[];
  summaryPdf: string;
}

export interface VehicleForCreate {
  details: {
    name: string;
    model: string;
    year: number;
    size: Size;
    engine: string;
    power: string;
    gvw: number;
    fuelTank: number;
    tires: number;
    mileage: number;
    chassisType: string;
    category: Category;
    capacity: number;
    pricePerDay: number;
    pricePerKm: number;
    identificationNumber: string;
    isPromoted: boolean;
    images: (string | Express.Multer.File)[];
    vehicleRegistration: (string | Express.Multer.File)[];
    summaryPdf: string | Express.Multer.File;
    slug?: string;
  };
  company: Types.ObjectId;
  reserved: Types.ObjectId[];
  likes: Types.ObjectId[];
  available: boolean;
}

export interface VehicleFilters {
  isPromoted: boolean;
}
