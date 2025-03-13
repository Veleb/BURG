import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  _id: string;
  companyName: string;
  companyEmail: string;
  carsAvailable: VehicleInterface[];
  companyLocation: string;
  websiteURL?: string;
  companyPhoneNumber?: string;
}

export interface CompanyForPartner {
  companyName: string;
  companyEmail: string;
  companyPhoneNumber: string;
  companyLocation: string;
  vehicles: number;
  websiteURL?: string;
}