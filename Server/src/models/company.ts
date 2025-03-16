import { Schema, Types, model } from "mongoose";
import { CompanyInterface } from "../types/model-types/company-types";

const CompanySchema = new Schema<CompanyInterface>({
  companyName: { type: String, required: true },
  companyEmail: { type: String, required: true },
  companyPhoneNumber: { type: String, required: true },
  companyLocation: { type: String },
  numberOfVehicles: { type: Number, required: true },

  status: { type: String, required: true },

  carsAvailable: [{ type: Types.ObjectId, ref: 'Vehicle' }], 
  
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CompanyModel = model('Company', CompanySchema);

export default CompanyModel;
