import { Schema, Types, model } from "mongoose";
import { CompanyInterface } from "../types/model-types/company-types";
import slugify from "slugify";

const CompanySchema = new Schema<CompanyInterface>({

  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  email: { type: String, required: true, unique: true, match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
  phoneNumber: { type: String, required: true, match: [/^\+[1-9]\d{1,14}$/, 'Phone number must be in E.164 format'], },
  location: { 
    text: { type: String, required: true }, 
    lat: { type: Number, required: true }, 
    lng: { type: Number, required: true }
  },
  companyType: { type: String, required: true },
  stateRegistration: { type: String, required: true },
  
  transactions: [{ type: Types.ObjectId, ref: "Transaction" }],

  owner: { type: Types.ObjectId, ref: "User", required: true },

  status: { type: String, required: true },

  carsAvailable: [{ type: Types.ObjectId, ref: 'Vehicle' }], 

  totalEarnings: { type: Number, required: true, default: 0 },
  
  isPromoted: { type: Boolean, required: false, default: false },
  
  registrationImages: [{ type: String }]

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

CompanySchema.index({ owner: 1 });
CompanySchema.index({ isPromoted: 1 });
CompanySchema.index({ status: 1 });

CompanySchema.pre('save', async function (next) {
  const company = this as any;

  if (!company.isModified('name')) return next();

  const baseSlug = slugify(company.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  const Company = company.constructor;

  while (await Company.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  company.slug = slug;
  next();
});


const CompanyModel = model('Company', CompanySchema);

export default CompanyModel;
