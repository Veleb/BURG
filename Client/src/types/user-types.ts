import { CompanyInterface } from "./company-types";

export interface UserFromDB {
  _id: string;
  fullName: string,
  email: string;
  phoneNumber?: string;
  rents: string[];
  companies: CompanyInterface[] | string[] ;
  role: "user" | "host" | "admin";
  created_at: Date;
  updated_at: Date;
}

export interface UserForLogin {
  email: string;
  password: string,
}

export interface UserForRegister {
  fullName: string,
  email: string;
  phoneNumber?: string;  
}

export interface UpdateUserCredentials {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}

export interface UserForPartner {
  fullName: string;
  email: string;
  phone: string;
  vehicles: number;
}