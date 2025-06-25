import { NextFunction, Request, Response, Router } from "express";
import { AuthenticatedRequest } from "../types/requests/authenticatedRequest";
import { Types } from "mongoose";
import certificateService from "../services/certificateService";
import { generateCertificatePDF } from "../utils/certificateGenerator";
import { cloudinary } from "..";
import * as streamifier from "streamifier";

const certificateController = Router();

certificateController.get(
  `/`,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const certificates = await certificateService.getAllCertificates();

      if (!certificates) {
        res.status(400).json({ message: "Error while fetching certificates!" });
      }

      res
        .status(200)
        .json({ message: "Successfully fetched certificates!", certificates });
      return;
    } catch (err) {
      next(err);
    }
  }
);

certificateController.get(
  `/users`,
  async (req: Request, res: Response, next: NextFunction) => {
    const modifiedReq = req as AuthenticatedRequest;

    try {
      const userId = new Types.ObjectId(modifiedReq.user?._id);

      if (!userId) {
        res.status(400).json({ message: "User Id needs to be provided!" });
        return;
      }

      const certificates = await certificateService.getAllUserCertificates(
        userId
      );

      if (!certificates) {
        res.status(400).json({ message: "Error while fetching certificates!" });
      }

      res
        .status(200)
        .json({ message: "Successfully fetched certificates!", certificates });
      return;
    } catch (err) {
      next(err);
    }
  }
);

certificateController.post(
  `/verify-certificate`,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { certificateCode } = req.body;

      if (!certificateCode) {
        res
          .status(400)
          .json({ message: "Certificate code or userId is required." });
        return;
      }

      const [isValid, certificate] = await certificateService.verifyCertificate(
        certificateCode
      );

      if (!certificate) {
        res
          .status(400)
          .json({ message: "Error occurred while verifying certificate" });
        return;
      }

      if (isValid) {
        if (certificate !== true) {
          res.status(200).json({
            message: "Certificate is valid.",
            valid: true,
            downloadLink: certificate.downloadLink,
            code: certificate.code,
          });
        } else {
          res
            .status(400)
            .json({ message: "Certificate is invalid.", valid: false });
        }
        return;
      } else {
        res.status(400).json({
          message: "Certificate is invalid.",
          valid: false,
          downloadLink: undefined,
          code: null,
        });
        return;
      }
    } catch (error) {
      next(error);
    }
  }
);

certificateController.post(
  `/add`,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        issuedTo,
        downloadLink,
        position,
        isRedeemed,
        redeemed_at,
        userId,
      } = req.body.certificate;

      if (
        !issuedTo ||
        !downloadLink ||
        !position ||
        typeof isRedeemed !== "boolean" ||
        !userId
      ) {
        res.status(400).json({ message: "Incorrect data provided." });
        return;
      }

      const userObjectId = new Types.ObjectId(userId);

      const certificate = await certificateService.addCertificate(
        issuedTo,
        downloadLink,
        position,
        isRedeemed,
        redeemed_at,
        userObjectId
      );

      const customDate = new Date(certificate.created_at);
      const dateString = `${customDate.getDate()}/${
        customDate.getMonth() + 1
      }/${customDate.getFullYear()}`;

      const pdfBuffer = await generateCertificatePDF({
        issuedTo: certificate.issuedTo,
        position: certificate.position,
        code: certificate.code,
        date: dateString,
      });

      // Upload to Cloudinary
      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            public_id: `certificates/${certificate.code}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
      });

      // Optionally update the downloadLink
      certificate.downloadLink = uploadResult.secure_url;
      await certificate.save();

      res.status(200).json({
        message: "Certificate created and uploaded successfully.",
        certificate,
        cloudinaryUrl: uploadResult.secure_url,
      });
    } catch (error) {
      next(error);
    }
  }
);

certificateController.post(
  `/add-user`,
  async (req: Request, res: Response, next: NextFunction) => {
    const modifiedReq = req as AuthenticatedRequest;

    try {
      let { certificateCode, userId } = req.body;

      if (userId === "") {
        userId = modifiedReq.user?._id;
      }

      if (!certificateCode || !userId) {
        res
          .status(400)
          .json({ message: "Certificate code or userId is required." });
        return;
      }

      const cert = await certificateService.redeemCertificate(
        certificateCode,
        userId
      );

      if (!cert) {
        res.status(404).json({ message: "Invalid certificate code" });
        return;
      }

      res.status(200).json({ message: "Certificate redeemed", cert });
      return;
    } catch (error) {
      next(error);
    }
  }
);

certificateController.post(
  `/redeem`,
  async (req: Request, res: Response, next: NextFunction) => {
    const modifiedReq = req as AuthenticatedRequest;

    try {
      const userId = new Types.ObjectId(modifiedReq.user?._id);

      const { certificateCode } = req.body;

      if (!certificateCode || !userId) {
        res
          .status(400)
          .json({ message: "Certificate code or userId is required." });
        return;
      }

      const cert = await certificateService.redeemCertificate(
        certificateCode,
        userId
      );

      if (!cert) {
        res.status(404).json({ message: "Invalid certificate code" });
        return;
      }

      res.status(200).json({ message: "Certificate redeemed", cert });
      return;
    } catch (error) {
      next(error);
    }
  }
);

export default certificateController;
