import { Schema, Types, model } from "mongoose";
import { CompanyInterface } from "../types/model-types/company-types";

const CompanySchema = new Schema<CompanyInterface>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  websiteURL: { type: String, required: false },
  logo: { type: String, required: true },
  companyPhoneNumber: { type: String, required: true },

  carsAvailable: [{ 
    type: Types.ObjectId, 
    ref: 'Vehicle' 
  }], 
  
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CompanyModel = model('Company', CompanySchema);

export default CompanyModel;
