import { NextFunction, Request, Response, Router } from "express";
import { authenticatedRequest } from "../types/requests/authenticatedRequest";
import { Types } from "mongoose";
import certificateService from "../services/certificateService";

const certificateController = Router();

certificateController.post(`/verify-certificate`, async (req: Request, res: Response, next: NextFunction) => {

  const modifiedReq = req as authenticatedRequest;

  const userId = new Types.ObjectId(modifiedReq.user?._id); 

  try {
    const { certificateCode } = modifiedReq.body;

    if (!certificateCode || !userId) {
      res.status(400).json({ message: "Certificate code or userId is required." });
      return; 
    }

    const isValid = await certificateService.verifyCertificate(userId, certificateCode);

    if (isValid) {
      res.status(200).json({ message: "Certificate is valid." });
      return; 
    } else {
      res.status(400).json({ message: "Certificate is invalid." });
      return; 
    }
  } catch (error) {
    next(error);
  }

})

  



export default certificateController;