import CompanyModel from "../models/company";
import UserModel from "../models/user";
import { CompanyForCreate } from "../types/model-types/company-types";

const getAllCompanies = async () => {
  return await CompanyModel.find().lean();
};

const getCompanyById = async (id: string) => {
  return await CompanyModel.findById(id)
  .populate('owner')
  .populate('carsAvailable')
  .lean();
};

const getCompanyBySlug = async (slug: string) => {
  return await CompanyModel.findOne({ slug })
  .populate('owner')
  .populate('carsAvailable')
  .lean();
};

const createCompany = async (data: CompanyForCreate) => {
  try {
    const company = new CompanyModel(data);
    await company.save();                         

    
    if (company) {
      await UserModel.findByIdAndUpdate(
        data.owner, 
        { $push: { companies: company._id } },
        { new: true }
      );
    } else {
      throw new Error('Company not found');
    }
  
    return company;
  } catch (err) {
    console.error("Create company error:", err);
    throw new Error('Error creating company');
  }
};

const updateCompanyStatus = async (id: string, status: 'pending' | 'confirmed' | 'canceled' | "hold" | "banned") => {
  try {
    const updatedCompany = await CompanyModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
    .populate('owner');
  
    return updatedCompany;
  } catch (err) {
    throw new Error('Error updating company status');
  }
};

const getPendingCompanies = async () => {
  return await CompanyModel.find({ status: 'pending' });
};

const promoteCompany = async (id: string) => {
  return await CompanyModel.findByIdAndUpdate(
    id, 
    { isPromoted: true },
    { new: true } 
  )
}

const deomoteCompany = async (id: string) => {
  return await CompanyModel.findByIdAndUpdate(
    id, 
    { isPromoted: false },
    { new: true } 
  )
}


const companyService = {
  getCompanyById,
  getCompanyBySlug,
  createCompany,
  getAllCompanies,
  updateCompanyStatus,
  getPendingCompanies,
  deomoteCompany,
  promoteCompany
};

export default companyService;