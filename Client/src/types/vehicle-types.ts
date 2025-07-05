import { CompanyInterface } from './company-types';
import { CategoryEnum, Size } from './enums';
import { RentInterface } from './rent-types';

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
  name: string;
  slug: string;
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
  category: CategoryEnum;
  capacity: number;
  pricePerDay: number;
  identificationNumber: string;
  pricePerKm: number;
  images: string[];
  vehicleRegistration: string[];
  isPromoted: boolean;
  summaryPdf: string;
}

export interface VehicleForCreate {
  vehicleName: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleSize: Size | string;
  vehicleEngine: string;
  vehiclePower: string;
  vehicleGvw: number;
  vehicleFuelTank: number;
  vehicletires: number;
  vehicleMileage: number;
  vehicleChassisType: string;
  vehicleCategory: CategoryEnum | string;
  vehicleCapacity: number;
  identificationNumber: string;
  vehiclePricePerDay: number;
  vehiclePricePerKm: number;
  vehicleImages: (string | File)[];
  vehicleRegistration: (string | File)[];
  summaryPdf: string | File;
  vehicleCompany: string;
  isPromoted: boolean;
}

export interface FilterState {
  categories: string[];
  year?: number;
  sort: {
    key: 'price' | 'year' | 'likes' | 'none';
    direction: 'asc' | 'desc';
  };
  priceMin?: number;
  priceMax?: number;
  showOnlyAvailable: boolean;
}
