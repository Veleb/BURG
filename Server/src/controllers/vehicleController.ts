import { Router, Request, Response, NextFunction } from "express";
import vehicleService from "../services/vehicleService";
import { VehicleForCreate, VehicleInterface } from "../types/model-types/vehicle-types";
import { authenticatedRequest } from "../types/requests/authenticatedRequest";
import mongoose, { Types } from "mongoose";
import { CompanyInterface } from "../types/model-types/company-types";
import companyService from "../services/companyService";

const vehicleController = Router();

vehicleController.get('', async (req: Request, res: Response, next: NextFunction) => {
  try {

    const vehicles: VehicleInterface[] = await vehicleService.getAllVehicles();

    res.status(200).json(vehicles);
    return;

  } catch (err) {
    next(err);
  }
})

vehicleController.get('/company/:companyId', async (req: Request, res: Response, next: NextFunction) => {
  const companyId = req.params.companyId;
  
  try {
    const vehicles: VehicleInterface[] = await vehicleService.getCompanyVehicles(companyId);

    if (!vehicles || vehicles.length === 0) {
      res.status(404).json({ message: 'No vehicles found for this company.' });
      return;
    }

    res.status(200).json(vehicles);
    return;
  } catch (err) {
    next(err);
  }
});


vehicleController.get('/:vehicleId', async (req: Request, res: Response, next: NextFunction) => {
  const vehicleId: string = req.params.vehicleId;

  if (!vehicleId) {
    res.status(400).json({ message: 'Vehicle ID is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    res.status(400).json({ message: 'Invalid vehicle ID format' });
    return; 
  }

  try {
    const vehicle: VehicleInterface = await vehicleService.getVehicleById(vehicleId);

    if (!vehicle) {
      res.status(400).json({ message: 'Vehicle not found' });
      return; 
    }

    res.status(200).json(vehicle);
    return;

  } catch (err) {
    next(err);
  }
})

vehicleController.post('/available', async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { start, end, vehicle } = req.body;

    const startDate: Date = new Date(start);  
    const endDate: Date = new Date(end);

    if (isNaN(startDate.getTime())) {
      res.status(400).json({ message: 'Invalid start date' });
      return; 
    }

    if (isNaN(endDate.getTime())) {
      res.status(400).json({ message: 'Invalid end date' });
      return; 
    }

    const isAvailable: boolean = await vehicleService.checkAvailability(vehicle, startDate, endDate);

    res.status(200).json(isAvailable);
    return;
    
  } catch (err) {
    next(err);
  }
});

vehicleController.post('/like/:vehicleId', async (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as authenticatedRequest;

  const vehicleId: string = customReq.params.vehicleId;

  try {

    if (!vehicleId) {
      res.status(400).json({ message: 'Vehicle ID is required' });
      return;
    }

    const userId: Types.ObjectId | undefined = customReq.user?._id;
    
    if (!userId) {
      res.status(401).json({ message: 'Please log in to continue!' });
      return;
    }

    const updatedVehicle = await vehicleService.likeVehicle(vehicleId, userId);

    if (!updatedVehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return; 
    }

    res.status(200).json({
      message: 'Liked vehicle successfully!',
      likes: updatedVehicle.likes
    });

  } catch (err) {
    next(err);
  }
});

vehicleController.put('/unlike/:vehicleId', async (req: Request, res: Response, next: NextFunction) => {
  const customReq = req as authenticatedRequest;
  
  const vehicleId: string = customReq.params.vehicleId;

  try {

    if (!vehicleId) {
      res.status(400).json({ message: 'Vehicle ID is required' });
      return;
    }

    const userId: Types.ObjectId | undefined = customReq.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const updatedVehicle = await vehicleService.removeLikeVehicle(vehicleId, userId);

    if (!updatedVehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return; 
    }

    res.status(200).json({
      message: 'Unliked vehicle successfully!',
      likes: updatedVehicle.likes
    });

  } catch (err) {
    next(err);
  }
});

vehicleController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  const modifiedReq = req as authenticatedRequest;
  
  const userId: Types.ObjectId | undefined = modifiedReq.user?._id;

  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {

    const vehicleData = req.body;

    const company: CompanyInterface | null = await companyService.getCompanyById(vehicleData.vehicleCompany);

    if (company?.owner._id.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Unauthorized company access' });
      return;
    }

    const vehicleDataWithOwner : VehicleForCreate = {
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
        identificationNumber: vehicleData.vehicleidentificationNumber,
        images: vehicleData.vehicleImages,
        vehicleRegistration: vehicleData.vehicleRegistration,
      },
      company: vehicleData.vehicleCompany,
      reserved: [],
      likes: [],
      available: true
    }

    const vehicle: VehicleInterface | null = await vehicleService.createVehicle(vehicleDataWithOwner);

    if (!vehicle) {
      res.status(400).json({ message: 'Error creating vehicle' });
      return; 
    }

    res.status(201).json(vehicle);
    return;

  } catch (err) {
    next(err);
  }
})

vehicleController.put('/', async (req: Request, res: Response, next: NextFunction) => {
  const modifiedReq = req as authenticatedRequest;
  
  const userId: Types.ObjectId | undefined = modifiedReq.user?._id;

  if (!userId) {
    res.status(400).json({ message: 'User ID is required' });
    return;
  }

  try {

    const vehicleData = req.body.vehicleData;
    const vehicleId: Types.ObjectId | null = req.body.vehicleId;

    if (!vehicleId) {
      res.status(400).json({ message: 'Vehicle ID is required' });
      return;
    }

    const company: CompanyInterface | null = await companyService.getCompanyById(vehicleData.vehicleCompany);

    if (company?.owner._id.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Unauthorized company access' });
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
        identificationNumber: vehicleData.vehicleidentificationNumber,
        images: vehicleData.vehicleImages,
        vehicleRegistration: vehicleData.vehicleRegistration,
      },
      company: vehicleData.vehicleCompany,
      reserved: [],
      likes: [],
      available: true
    }

    const vehicle: VehicleInterface | null = await vehicleService.updateVehicle(vehicleId, vehicleDataWithOwner);

    if (!vehicle) {
      res.status(400).json({ message: 'Error creating vehicle' });
      return; 
    }

    res.status(201).json(vehicle);
    return;

  } catch (err) {
    next(err);
  }
})

vehicleController.delete('/:vehicleId', async (req: Request, res: Response, next: NextFunction) => {
  const vehicleId: string = req.params.vehicleId;

  if (!vehicleId) {
    res.status(400).json({ message: 'Vehicle ID is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
    res.status(400).json({ message: 'Invalid vehicle ID format' });
    return; 
  }

  try {
    const vehicle: VehicleInterface | null = await vehicleService.deleteVehicleById(vehicleId);

    if (!vehicle) {
      res.status(400).json({ message: 'Vehicle not found' });
      return; 
    }

    res.status(200).json(vehicle);
    return;

  } catch (err) {
    next(err);
  }
})


export default vehicleController;