  import CompanyModel from "../models/company";
  import UserModel from "../models/user";
  import { CompanyInterface } from "../types/model-types/company-types";

  const getAllCompanies = async () => {
    return await CompanyModel.find();
  };

  const getCompanyById = async (id: string) => {
    return await CompanyModel.findById(id).populate('owner').lean();
  };

  const createCompany = async (data: Omit<CompanyInterface, '_id'>) => {
    try {
      const company = await CompanyModel.create(data);

      await UserModel.findByIdAndUpdate(
        data.owner, 
        { $push: { companies: company._id } },
        { new: true }
      );

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
