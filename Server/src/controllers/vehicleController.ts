import { Router, Request, Response, NextFunction } from "express";
import vehicleService from "../services/vehicleService";
import {
  VehicleForCreate,
  VehicleInterface,
} from "../types/model-types/vehicle-types";
import { AuthenticatedRequest } from "../types/requests/authenticatedRequest";
import mongoose, { Model, Types } from "mongoose";
import { CompanyInterface } from "../types/model-types/company-types";
import companyService from "../services/companyService";
import upload from "../middlewares/upload";
import slugToIdMiddleware from "../middlewares/slugToIdMiddleware";
import CompanyModel from "../models/company";
import { HasSlug } from "../types/documentSlug";
import VehicleModel from "../models/vehicle";

const vehicleController = Router();

vehicleController.get(
  "",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await vehicleService.getVehicles({ limit, offset });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.get(
  "/count",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await vehicleService.getCount();

      if (!count) {
        res
          .status(400)
          .json({ message: "Error occurred getting total vehicle count." });
        return;
      }

      res.status(200).json(count);
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.get(
  "/company/:companySlug",
  slugToIdMiddleware({ model: CompanyModel as unknown as Model<HasSlug> }),
  async (req: Request, res: Response, next: NextFunction) => {
    const companyId = req.params.companyId;

    try {
      const vehicles: VehicleInterface[] =
        await vehicleService.getCompanyVehicles(companyId);

      if (!vehicles || vehicles.length === 0) {
        res
          .status(404)
          .json({ message: "No vehicles found for this company." });
        return;
      }

      res.status(200).json(vehicles);
      return;
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.get(
  "/:vehicleId",
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicleId: string = req.params.vehicleId;

    if (!vehicleId) {
      res.status(400).json({ message: "Vehicle ID is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      res.status(400).json({ message: "Invalid vehicle ID format" });
      return;
    }

    try {
      const vehicle: VehicleInterface = await vehicleService.getVehicleById(
        vehicleId
      );

      if (!vehicle) {
        res.status(400).json({ message: "Vehicle not found" });
        return;
      }

      res.status(200).json(vehicle);
      return;
    } catch (err) {
      next(err);
    }
  }
);

// vehicleController.get(
//   "/slug/:vehicleSlug",
//   slugToIdMiddleware({ model: VehicleModel as unknown as Model<HasSlug>, slugParam: 'vehicleSlug', idParam: 'vehicleId'}),
//   async (req: Request, res: Response, next: NextFunction) => {
//     const vehicleId: string = req.params.vehicleId;

//     if (!vehicleId) {
//       res.status(400).json({ message: "Vehicle ID is required" });
//       return;
//     }

//     if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
//       res.status(400).json({ message: "Invalid vehicle ID format" });
//       return;
//     }

//     try {
//       const vehicle: VehicleInterface = await vehicleService.getVehicleById(
//         vehicleId
//       );

//       if (!vehicle) {
//         res.status(400).json({ message: "Vehicle not found" });
//         return;
//       }

//       res.status(200).json(vehicle);
//       return;
//     } catch (err) {
//       next(err);
//     }
//   }
// );

vehicleController.get(
  "/slug/:vehicleSlug",
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicleSlug = req.params.vehicleSlug;

    try {
      const vehicle = await vehicleService.getVehicleBySlug(vehicleSlug);
      res.status(200).json(vehicle);
      return; 
    } catch (err) {
      res.status(404).json({ message: "Vehicle not found" });
      next(err);
      return; 
    }
  }
);

vehicleController.get(
  `/referral-code/:referralCode`,
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    const userId: Types.ObjectId | undefined = customReq.user?._id;
    const referralCode = req.params.referralCode;

    try {
      if (!userId) {
        res.status(401).json({ message: "Unauthorized!" });
        return;
      }

      const isValid = await vehicleService.isReferralValid(
        referralCode,
        userId
      );

      res.status(200).json({
        message: isValid
          ? "Referral code is valid"
          : "Referral code is invalid",
        valid: isValid,
      });
      return;
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.post(
  "/available",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { start, end, vehicle } = req.body;

      const startDate: Date = new Date(start);
      const endDate: Date = new Date(end);

      if (isNaN(startDate.getTime())) {
        res.status(400).json({ message: "Invalid start date" });
        return;
      }

      if (isNaN(endDate.getTime())) {
        res.status(400).json({ message: "Invalid end date" });
        return;
      }

      const isAvailable: boolean = await vehicleService.checkAvailability(
        vehicle,
        startDate,
        endDate
      );

      res.status(200).json(isAvailable);
      return;
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.post(
  "/like/:vehicleId",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    const vehicleId: string = customReq.params.vehicleId;

    try {
      if (!vehicleId) {
        res.status(400).json({ message: "Vehicle ID is required" });
        return;
      }

      const userId: Types.ObjectId | undefined = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Please log in to continue!" });
        return;
      }

      const updatedVehicle = await vehicleService.likeVehicle(
        vehicleId,
        userId
      );

      if (!updatedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

      res.status(200).json({
        message: "Liked vehicle successfully!",
        likes: updatedVehicle.likes,
      });
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.put(
  "/unlike/:vehicleId",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    const vehicleId: string = customReq.params.vehicleId;

    try {
      if (!vehicleId) {
        res.status(400).json({ message: "Vehicle ID is required" });
        return;
      }

      const userId: Types.ObjectId | undefined = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized." });
        return;
      }

      const updatedVehicle = await vehicleService.removeLikeVehicle(
        vehicleId,
        userId
      );

      if (!updatedVehicle) {
        res.status(404).json({ message: "Vehicle not found" });
        return;
      }

      res.status(200).json({
        message: "Unliked vehicle successfully!",
        likes: updatedVehicle.likes,
      });
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "registrations", maxCount: 10 },
    { name: "summaryPdf", maxCount: 1 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    const modifiedReq = req as AuthenticatedRequest;

    const userId: Types.ObjectId | undefined = modifiedReq.user?._id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    try {
      const vehicleData = JSON.parse(req.body.vehicleData);

      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const company: CompanyInterface | null =
        await companyService.getCompanyById(vehicleData.vehicleCompany);

      if (company?.owner._id.toString() !== userId.toString()) {
        res.status(403).json({ message: "Unauthorized company access" });
        return;
      }

      const vehicleDataWithOwner: VehicleForCreate = {
        details: {
          name: vehicleData.vehicleName,
          model: vehicleData.vehicleModel,
          size: vehicleData.vehicleSize,
          category: vehicleData.vehicleCategory,
          pricePerDay: Number(vehicleData.vehiclePricePerDay),
          pricePerKm: Number(vehicleData.vehiclePricePerKm),
          year: Number(vehicleData.vehicleYear),
          engine: vehicleData.vehicleEngine,
          power: vehicleData.vehiclePower,
          gvw: Number(vehicleData.vehicleGvw),
          fuelTank: Number(vehicleData.vehicleFuelTank),
          tyres: Number(vehicleData.vehicleTyres),
          mileage: Number(vehicleData.vehicleMileage),
          chassisType: vehicleData.vehicleChassisType,
          capacity: Number(vehicleData.vehicleCapacity),
          identificationNumber: vehicleData.identificationNumber,
          isPromoted: vehicleData.isPromoted,
          images: files?.images ?? [],
          vehicleRegistration: files?.registrations ?? [],
          summaryPdf: files?.summaryPdf ? files.summaryPdf[0] : "",
        },
        company: vehicleData.vehicleCompany,
        reserved: [],
        likes: [],
        available: true,
      };

      const vehicle: VehicleInterface | null =
        await vehicleService.createVehicle(vehicleDataWithOwner);

      if (!vehicle) {
        res.status(400).json({ message: "Error creating vehicle" });
        return;
      }

      // res.status(201).json({message: 'Vehicle created successfully!', vehicle});
      res.status(201).json(vehicle);
      return;
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.post(
  "/bulk",
  async (req: Request, res: Response, next: NextFunction) => {
    const modifiedReq = req as AuthenticatedRequest;

    const userId: Types.ObjectId | undefined = modifiedReq.user?._id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    try {
      const vehiclesData = req.body.vehicles;

      if (!vehiclesData || vehiclesData.length === 0) {
        res.status(400).json({ message: "No vehicle data provided" });
        return;
      }

      const vehiclesWithOwner: VehicleForCreate[] = vehiclesData.map(
        (vehicleData: any) => ({
          details: {
            name: vehicleData.details.name,
            model: vehicleData.details.model,
            size: vehicleData.details.size,
            category: vehicleData.details.category,
            pricePerDay: vehicleData.details.pricePerDay,
            pricePerKm: vehicleData.details.pricePerKm,
            year: vehicleData.details.year,
            engine: vehicleData.details.engine,
            power: vehicleData.details.power,
            gvw: vehicleData.details.gvw,
            fuelTank: vehicleData.details.fuelTank,
            tyres: vehicleData.details.tyres,
            mileage: vehicleData.details.mileage,
            chassisType: vehicleData.details.chassisType,
            capacity: vehicleData.details.capacity,
            identificationNumber: vehicleData.details.identificationNumber,
            images: vehicleData.details.images,
            vehicleRegistration: vehicleData.details.vehicleRegistration,
          },
          company: vehicleData.company,
          reserved: [],
          likes: [],
          available: true,
        })
      );

      const createdVehicles = await vehicleService.createBulk(
        vehiclesWithOwner
      );

      res.status(201).json({
        message: "Vehicles created successfully!",
        vehicles: createdVehicles,
      });
      return;
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.put(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const modifiedReq = req as AuthenticatedRequest;

    const userId: Types.ObjectId | undefined = modifiedReq.user?._id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    try {
      const vehicleData = req.body.vehicleData;
      const vehicleId: Types.ObjectId | null = req.body.vehicleId;

      if (!vehicleId) {
        res.status(400).json({ message: "Vehicle ID is required" });
        return;
      }

      const company: CompanyInterface | null =
        await companyService.getCompanyById(vehicleData.vehicleCompany);

      if (company?.owner._id.toString() !== userId.toString()) {
        res.status(403).json({ message: "Unauthorized company access" });
        return;
      }

      const vehicleDataWithOwner: VehicleForCreate = {
        details: {
          name: vehicleData.vehicleName,
          model: vehicleData.vehicleModel,
          size: vehicleData.vehicleSize,
          category: vehicleData.vehicleCategory,
          pricePerDay: vehicleData.vehiclePricePerDay,
          pricePerKm: vehicleData.vehiclePricePerKm,
          year: vehicleData.vehicleYear,
          engine: vehicleData.vehicleEngine,
          power: vehicleData.vehiclePower,
          gvw: vehicleData.vehicleGvw,
          fuelTank: vehicleData.vehicleFuelTank,
          tyres: vehicleData.vehicleTyres,
          mileage: vehicleData.vehicleMileage,
          chassisType: vehicleData.vehicleChassisType,
          capacity: vehicleData.vehicleCapacity,
          isPromoted: vehicleData.isPromoted,
          identificationNumber: vehicleData.identificationNumber,
          images: vehicleData.vehicleImages,
          vehicleRegistration: vehicleData.vehicleRegistration,
          summaryPdf: vehicleData.summaryPdf,
        },
        company: vehicleData.vehicleCompany,
        reserved: [],
        likes: [],
        available: true,
      };

      const vehicle: VehicleInterface | null =
        await vehicleService.updateVehicle(vehicleId, vehicleDataWithOwner);

      if (!vehicle) {
        res.status(400).json({ message: "Error creating vehicle" });
        return;
      }

      res.status(201).json(vehicle);
      return;
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.delete(
  "/:vehicleId",
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicleId: string = req.params.vehicleId;

    if (!vehicleId) {
      res.status(400).json({ message: "Vehicle ID is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      res.status(400).json({ message: "Invalid vehicle ID format" });
      return;
    }

    try {
      const vehicle: VehicleInterface | null =
        await vehicleService.deleteVehicleById(vehicleId);

      if (!vehicle) {
        res.status(400).json({ message: "Vehicle not found" });
        return;
      }

      res.status(200).json(vehicle);
      return;
    } catch (err) {
      next(err);
    }
  }
);

vehicleController.delete(
  "/slug/:vehicleSlug",
  slugToIdMiddleware({ model: VehicleModel as unknown as Model<HasSlug>, slugParam: 'vehicleSlug', idParam: 'vehicleId'}),
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicleId: string = req.params.vehicleId;

    if (!vehicleId) {
      res.status(400).json({ message: "Vehicle ID is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      res.status(400).json({ message: "Invalid vehicle ID format" });
      return;
    }

    try {
      const vehicle: VehicleInterface | null =
        await vehicleService.deleteVehicleById(vehicleId);

      if (!vehicle) {
        res.status(400).json({ message: "Vehicle not found" });
        return;
      }

      res.status(200).json(vehicle);
      return;
    } catch (err) {
      next(err);
    }
  }
);



export default vehicleController;
