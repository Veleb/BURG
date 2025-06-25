import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/requests/authenticatedRequest";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as AuthenticatedRequest;

  if (customReq.user?.role !== "admin") {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  next();
};

export default adminMiddleware;
