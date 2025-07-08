import { NextFunction, Request, Response, Router } from "express";
import companyService from "../services/companyService";
import { AuthenticatedRequest } from "../types/requests/authenticatedRequest";
import {
  CompanyForCreate,
  CompanyInterface,
} from "../types/model-types/company-types";
import { UserInterface } from "../types/model-types/user-types";
import UserService from "../services/userService";
import { Types } from "mongoose";
import adminMiddleware from "../middlewares/adminMiddleware";
import upload from "../middlewares/upload";

const companyController = Router();

companyController.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companies = await companyService.getAllCompanies();

      if (!companies || companies.length === 0) {
        res.status(404).json({ message: "Companies not found!" });
        return;
      }

      res.status(200).json(companies);
    } catch (err) {
      next(err);
    }
  }
);

companyController.get(
  "/pending",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pendingCompanies = await companyService.getPendingCompanies();

      if (!pendingCompanies || pendingCompanies.length === 0) {
        res.status(404).json({ message: "No pending companies found!" });
        return;
      }

      res.status(200).json(pendingCompanies);
    } catch (err) {
      next(err);
    }
  }
);

companyController.post(
  "/",
  upload.fields([{ name: "registrationImages", maxCount: 5 }]),
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    try {
      const userId: Types.ObjectId | undefined = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Authentication required" });
        return;
      }

      let registrationImages: Express.Multer.File[] = [];

      if (req.files && !Array.isArray(req.files) && typeof req.files === "object") {
        registrationImages = (req.files["registrationImages"] as Express.Multer.File[]) || [];
      }

      const companyData = {
        name: req.body.companyName,
        email: req.body.companyEmail,
        phoneNumber: req.body.companyPhone,
        location: JSON.parse(req.body.companyLocation),
        companyType: req.body.companyType,
        stateRegistration: req.body.stateRegistration,
        registrationImages
      };

      const dataWithOwner: CompanyForCreate = {
        ...companyData,
        owner: userId,
        status: "pending" as "pending" | "confirmed" | "canceled",
        totalEarnings: 0,
        transactions: [],
      };

      const newCompany = await companyService.createCompany(dataWithOwner);

      res.status(201).json(newCompany);
    } catch (err) {
      next(err);
    }
  }
);

companyController.put(
  "/confirm/:id",
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId: string | undefined = req.params.id;

      if (!companyId) {
        res.status(400).json({ message: "Company ID must be provided!" });
        return;
      }

      const updatedCompany: CompanyInterface | null =
        await companyService.updateCompanyStatus(companyId, "confirmed");

      if (!updatedCompany) {
        res.status(404).json({ message: "Company not found!" });
        return;
      }

      await UserService.promoteUserStatus(
        (updatedCompany.owner as UserInterface)._id,
        "host"
      );

      res.status(200).json(updatedCompany);
      return;
    } catch (err) {
      next(err);
    }
  }
);

companyController.put(
  "/hold/:id",
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId: string | undefined = req.params.id;

      if (!companyId) {
        res.status(400).json({ message: "Company ID must be provided!" });
        return;
      }

      const updatedCompany: CompanyInterface | null =
        await companyService.updateCompanyStatus(companyId, "hold");

      if (!updatedCompany) {
        res.status(404).json({ message: "Company not found!" });
        return;
      }

      if (( updatedCompany.owner as UserInterface).role !== "admin" ) {
        await UserService.promoteUserStatus(
          (updatedCompany.owner as UserInterface)._id,
          "user"
        );
      }

      res.status(200).json(updatedCompany);
      return;
    } catch (err) {
      next(err);
    }
  }
);

companyController.put(
  "/ban/:id",
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId: string | undefined = req.params.id;

      if (!companyId) {
        res.status(400).json({ message: "Company ID must be provided!" });
        return;
      }

      const updatedCompany: CompanyInterface | null = await companyService.updateCompanyStatus(companyId, "banned");

      if (!updatedCompany) {
        res.status(404).json({ message: "Company not found!" });
        return;
      }
      
      if (( updatedCompany.owner as UserInterface).role !== "admin" ) {
        await UserService.promoteUserStatus(
          (updatedCompany.owner as UserInterface)._id,
          "user"
        );
      }

      res.status(200).json(updatedCompany);
      return;
    } catch (err) {
      next(err);
    }
  }
);

companyController.put(
  "/cancel/:id",
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.params.id;
      const updatedCompany = await companyService.updateCompanyStatus(
        companyId,
        "canceled"
      );

      if (!updatedCompany) {
        res.status(404).json({ message: "Company not found!" });
        return;
      }

      if (( updatedCompany.owner as UserInterface).role !== "admin" ) {
        await UserService.promoteUserStatus(
          (updatedCompany.owner as UserInterface)._id,
          "user"
        );
      }

      res.status(200).json(updatedCompany);
    } catch (err) {
      next(err);
    }
  }
);

companyController.post(
  "/promote/:id",
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.params.id;

      const updatedCompany = await companyService.promoteCompany(companyId);

      if (!updatedCompany) {
        res.status(404).json({ message: "Company not found!" });
        return;
      }

      res.status(200).json(updatedCompany);
    } catch (err) {
      next(err);
    }
  }
);

companyController.post(
  "/demote/:id",
  adminMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.params.id;

      const updatedCompany = await companyService.deomoteCompany(companyId);

      if (!updatedCompany) {
        res.status(404).json({ message: "Company not found!" });
        return;
      }

      res.status(200).json(updatedCompany);
    } catch (err) {
      next(err);
    }
  }
);

companyController.get(
  "/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = req.params.slug;
      
      const company = await companyService.getCompanyBySlug(slug);
      
      res.status(200).json(company);
    } catch (err) {
      next(err);
    }
  }
);

export default companyController;
