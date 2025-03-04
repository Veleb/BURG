import { NextFunction, Request, Response, Router } from 'express';
import companyService from '../services/companyService';


const companyController = Router();

companyController.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {

    const companies = await companyService.getAllCompanies();

    if (!companies) {
      res.status(500).json({ message: 'Companies not found!' });
      return;
    }

    res.status(200).json(companies);

  } catch (err) {
    next(err);
  }
}); 

export default companyController;
