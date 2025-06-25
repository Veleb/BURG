import { Request, Response, NextFunction } from "express";
import CompanyModel from "../models/company";
import { AuthenticatedRequest } from "../types/requests/authenticatedRequest";

export const companyOwnerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const customReq = req as AuthenticatedRequest;
  const userId = customReq.user?._id;
  const slug = req.params.slug;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const company = await CompanyModel.findOne({ slug });

  if (!slug) {
    return res.status(400).json({ message: "Company slug is required" });
  }

  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  if (company.owner.toString() !== userId.toString()) {
    return res
      .status(403)
      .json({ message: "Forbidden: You are not the owner of this company" });
  }

  next();
};

export default companyOwnerMiddleware;
