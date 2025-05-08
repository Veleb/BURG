import { NextFunction, Request, Response, Router } from "express";
import { authenticatedRequest } from "../types/requests/authenticatedRequest";
import { Types } from "mongoose";
import certificateService from "../services/certificateService";

const certificateController = Router();

certificateController.post(`/verify-certificate`, async (req: Request, res: Response, next: NextFunction) => {

  const modifiedReq = req as authenticatedRequest;

  try {
    const { certificateCode } = modifiedReq.body;

    if (!certificateCode) {
      res.status(400).json({ message: "Certificate code or userId is required." });
      return; 
    }

    const [isValid, downloadLink] = await certificateService.verifyCertificate(certificateCode);

    if (isValid) {
      res.status(200).json({ message: "Certificate is valid.", valid: true, downloadLink: downloadLink});
      return; 
    } else {
      res.status(400).json({ message: "Certificate is invalid.", valid: false, downloadLink: undefined });
      return; 
    }
  } catch (error) {
    next(error);
  }

})

certificateController.post(`/add`, async (req: Request, res: Response, next: NextFunction) => {

  const modifiedReq = req as authenticatedRequest;

  try {
    const { certificateDownloadLink, userId } = modifiedReq.body;

    if (!certificateDownloadLink || !userId) {
      res.status(400).json({ message: "Certificate link or userId is required." });
      return; 
    }

    const user = await certificateService.addCertificate(userId, certificateDownloadLink);
    
    res.status(200).json({ message: "Certificate added successfully.", user });
    return; 
    
  } catch (error) {
    next(error);
  }

})


export default certificateController;