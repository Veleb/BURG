import { VehicleInterface } from "./vehicle-types";

export interface CompanyInterface {
  name: string;
  location: string;
  websiteURL?: string;
  companyPhoneNumber: string;
  carsAvailable: VehicleInterface[];
  logo: string;
  _id: string;
}