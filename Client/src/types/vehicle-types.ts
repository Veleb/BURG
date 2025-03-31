import { CompanyInterface } from "./company-types";
import { CategoryEnum, Size } from "./enums";
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
  category: CategoryEnum;
  capacity: number;
  pricePerDay: number;
  identificationNumber: string
  pricePerKm: number;
  images: string[];
  vehicleRegistration: string[];
}

export interface VehicleForCreate {
  vehicleName: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleSize: Size;
  vehicleEngine: string;
  vehiclePower: string;
  vehicleGvw: number;
  vehicleFuelTank: number;
  vehicleTyres: number;
  vehicleMileage: number;
  vehicleChassisType: string;
  vehicleCategory: CategoryEnum;
  vehicleCapacity: number;
  vehicleidn: string;
  vehiclePricePerDay: number;
  vehiclePricePerKm: number;
  vehicleImages: string[];
  vehicleRegistration: string[];
  vehicleCompany: string,
};

export interface FilterState {
  categories: string[];
  year?: number;
  sort: {
    key: 'price' | 'year' | "likes" | 'none';
    direction: 'asc' | 'desc';
  };
}