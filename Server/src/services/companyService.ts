import CompanyModel from "../models/company";
import { CompanyInterface } from "../types/model-types/company-types";

const getAllCompanies = async () => {
  return await CompanyModel.find();
};

const getCompanyById = async (id: string) => {
  return await CompanyModel.findById(id);
};

const createCompany = async (data: CompanyInterface) => {
  return await CompanyModel.create(data);
};

const companyService = {
  getCompanyById,
  createCompany,
  getAllCompanies,
  
}

export default companyService;