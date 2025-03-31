  import { Types } from "mongoose";
import CompanyModel from "../models/company";
  import UserModel from "../models/user";
  import { CompanyForCreate, CompanyInterface } from "../types/model-types/company-types";

  const getAllCompanies = async () => {
    return await CompanyModel.find();
  };

  const getCompanyById = async (id: string) => {
    return await CompanyModel.findById(id).populate('owner').lean();
  };

  const createCompany = async (data: CompanyForCreate) => {
    try {
      const company = await CompanyModel.create(data);

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
      throw new Error('Error creating company');
    }
  };

  const updateCompanyStatus = async (id: string, status: 'pending' | 'confirmed' | 'canceled') => {
    try {
      const updatedCompany = await CompanyModel.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      return updatedCompany;
    } catch (err) {
      throw new Error('Error updating company status');
    }
  };

  const getPendingCompanies = async () => {
    return await CompanyModel.find({ status: 'pending' });
  };

  const companyService = {
    getCompanyById,
    createCompany,
    getAllCompanies,
    updateCompanyStatus,
    getPendingCompanies,
  };

  export default companyService;
