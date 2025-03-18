import { NextFunction, Request, Response, Router } from 'express';
import companyService from '../services/companyService';
import { authenticatedRequest } from '../types/requests/authenticatedRequest';
import { CompanyInterface } from '../types/model-types/company-types';

const companyController = Router();

companyController.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companies = await companyService.getAllCompanies();

    if (!companies || companies.length === 0) {
      res.status(404).json({ message: 'Companies not found!' });
      return; 
    }

    res.status(200).json(companies);

  } catch (err) {
    next(err);
  }
});

companyController.get('/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingCompanies = await companyService.getPendingCompanies();

    if (!pendingCompanies || pendingCompanies.length === 0) {
      res.status(404).json({ message: 'No pending companies found!' });
      return;
    }

    res.status(200).json(pendingCompanies);
  } catch (err) {
    next(err);
  }
});

// MAKE THIS SO WHEN A COMPANY IS CREATED IT GOES TO THE USER AS WELL

companyController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as authenticatedRequest;

  try {
    const userId = customReq.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return; 
    }

    const companyData = {
      name: req.body.companyName,
      email: req.body.companyEmail,
      phoneNumber: req.body.companyPhone,
      location: req.body.companyLocation,
      numberOfVehicles: req.body.companyVehicles
    };

    const dataWithOwner: CompanyInterface = { 
      ...companyData,
      owner: userId, 
      status: "pending" as "pending" | "confirmed" | "canceled",
    };

    const newCompany = await companyService.createCompany(dataWithOwner);
    
    res.status(201).json(newCompany);

  } catch (err) {
    next(err);
  }
});

companyController.put('/confirm/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.params.id;
    const updatedCompany = await companyService.updateCompanyStatus(companyId, 'confirmed');

    if (!updatedCompany) {
      res.status(404).json({ message: 'Company not found!' });
      return;
    }

    res.status(200).json(updatedCompany);
  } catch (err) {
    next(err);
  }
});

companyController.put('/cancel/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyId = req.params.id;
    const updatedCompany = await companyService.updateCompanyStatus(companyId, 'canceled');

    if (!updatedCompany) {
      res.status(404).json({ message: 'Company not found!' });
      return;
    }

    res.status(200).json(updatedCompany);
  } catch (err) {
    next(err);
  }
});


export default companyController;
