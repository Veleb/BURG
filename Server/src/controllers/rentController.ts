import { NextFunction, Request, Response, Router } from "express";
import { AuthenticatedRequest } from "../types/requests/authenticatedRequest";
import UserService from "../services/userService";
import rentService from "../services/rentService";
import { RentInterface } from "../types/model-types/rent-types";
import vehicleService from "../services/vehicleService";
import { Model, Types } from "mongoose";
import slugToIdMiddleware from "../middlewares/slugToIdMiddleware";
import CompanyModel from "../models/company";
import { HasSlug } from "../types/documentSlug";

const rentController = Router();

rentController.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const rents = await rentService.getAllRents(limit, offset);

      res.status(200).json(rents);
    } catch (error) {
      next(error);
    }
  }
);

rentController.get(
  "/count",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await rentService.getTotalRentCount();

      if (!count) {
        res
          .status(400)
          .json({ message: "Error occurred getting total rent count." });
        return;
      }

      res.status(200).json(count);
    } catch (err) {
      next(err);
    }
  }
);

rentController.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    try {
      const userId: Types.ObjectId | undefined = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const rentData = customReq.body as Partial<RentInterface>;

      if (
        !rentData.start ||
        !rentData.end ||
        !rentData.vehicle ||
        !rentData.pickupLocation ||
        !rentData.dropoffLocation
      ) {
        res.status(400).json({
          message:
            "Missing required rent details (start, end, vehicle, pickup and dropoff locations)",
        });
        return;
      }

      if (new Date(rentData.start) >= new Date(rentData.end)) {
        res
          .status(400)
          .json({ message: "Start date must be earlier than end date" });
        return;
      }

      const isAvailable = await vehicleService.checkAvailability(
        rentData.vehicle._id,
        new Date(rentData.start),
        new Date(rentData.end)
      );

      if (!isAvailable) {
        res
          .status(400)
          .json({ message: "Vehicle is not available for the selected dates" });
        return;
      }

      const newRentData: RentInterface = {
        ...rentData,
        user,
        status: "pending",
      } as RentInterface;
      const rent = await rentService.createRent(newRentData);

      res.status(201).json(rent);
      return;
    } catch (error) {
      next(error);
    }
  }
);

rentController.post(
  "/without-payment",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    try {
      const userId: Types.ObjectId | undefined = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (
        user.role !== "admin" ||
        !user.companies ||
        user.companies.length === 0 ||
        user.companies[0]?.isPromoted === false
      ) {
        res.status(403).json({ message: "Forbidden action" });
        return;
      }

      const rentData = customReq.body as Partial<RentInterface>;

      if (
        !rentData.start ||
        !rentData.end ||
        !rentData.vehicle ||
        !rentData.pickupLocation ||
        !rentData.dropoffLocation
      ) {
        res.status(400).json({
          message:
            "Missing required rent details (start, end, vehicle, pickup and dropoff locations)",
        });
        return;
      }

      if (new Date(rentData.start) >= new Date(rentData.end)) {
        res
          .status(400)
          .json({ message: "Start date must be earlier than end date" });
        return;
      }

      const isAvailable = await vehicleService.checkAvailability(
        rentData.vehicle._id,
        new Date(rentData.start),
        new Date(rentData.end)
      );

      if (!isAvailable) {
        res
          .status(400)
          .json({ message: "Vehicle is not available for the selected dates" });
        return;
      }

      const newRentData: RentInterface = {
        ...rentData,
        user,
        status: "confirmed",
      } as RentInterface;
      const rent = await rentService.rentWithoutPaying(newRentData);

      res.status(201).json(rent);
      return;
    } catch (error) {
      next(error);
    }
  }
);

rentController.get(
  "/company/:companySlug/count",
  slugToIdMiddleware({ model: CompanyModel as unknown as Model<HasSlug> }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId: Types.ObjectId = new Types.ObjectId(req.params.companyId);

      const rents = await rentService.getTotalCompanyRentCount(companyId);

      res.status(200).json(rents);
    } catch (error) {
      next(error);
    }
  }
);

rentController.get(
  "/company/:companySlug",
  slugToIdMiddleware({ model: CompanyModel as unknown as Model<HasSlug> }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId: Types.ObjectId = new Types.ObjectId(req.params.companyId);

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const rents = await rentService.getRentsByCompany(companyId, limit, offset);
      res.status(200).json(rents);
    } catch (error) {
      next(error);
    }
  }
);

rentController.get(
  "/:rentId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rentId = req.params.rentId;

      if (!rentId) {
        res.status(400).json({ message: "No rent ID provided." });
      }

      const rent = await rentService.getRentById(new Types.ObjectId(rentId));

      res.status(200).json(rent);
    } catch (error) {
      next(error);
    }
  }
);

rentController.get(
  "/:vehicleId/unavailable-dates",
  async (req: Request, res: Response, next: NextFunction) => {
    const vehicleId = new Types.ObjectId(req.params.vehicleId);

    if (!vehicleId) {
      res.status(400).json({ message: "Vehicle ID is required" });
      return;
    }

    try {
      const unavailableDates = await rentService.getUnavailableDates(vehicleId);

      if (!unavailableDates) {
        res.status(400).json({ message: "Unavailable dates not found" });
        return;
      }

      res.status(200).json(unavailableDates);

      return;
    } catch (err) {
      next(err);
    }
  }
);

rentController.post(
  "/cancel-rent",
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentId } = req.body;

    if (!rentId) {
      res.status(400).json({ message: "Rent ID is required." });
      return;
    }

    try {
      await rentService.changeRentStatus(rentId, "canceled");
      res.status(200).json({ message: "Rent canceled successfully." });
    } catch (error) {
      next(error);
    }
  }
);

export default rentController;
