import { Schema, Types, model } from "mongoose";
import { CompanyInterface } from "../types/model-types/company-types";

const CompanySchema = new Schema<CompanyInterface>({

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
  phoneNumber: { type: String, required: true },
  location: { type: String },
  companyType: { type: String, required: true },
  stateRegistration: { type: String, required: true },
  
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

  status: { type: String, required: true },

  carsAvailable: [{ type: Types.ObjectId, ref: 'Vehicle' }], 

  totalEarnings: { type: Number, required: true, default: 0 }
  
  
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CompanyModel = model('Company', CompanySchema);

export default CompanyModel;
