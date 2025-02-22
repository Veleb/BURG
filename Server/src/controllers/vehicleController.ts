import { Router, Request, Response, NextFunction } from "express";
import vehicleService from "../services/vehicleService";
import { VehicleInterface } from "../types/model-types/vehicle-types";
import { authenticatedRequest } from "../types/requests/authenticatedRequest";

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

vehicleController.get('/:vehicleId', async (req: Request, res: Response, next: NextFunction) => {
  const vehicleId: string = req.params.vehicleId;

  if (!vehicleId) {
    res.status(400).json({ message: 'Vehicle ID is required' });
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

    if (!start || !end || !vehicle) {
      res.status(400).json({ message: 'Start date, end date, and vehicle ID are required' });
      return; 
    }

    const startDate: Date = new Date(start);  
    const endDate: Date = new Date(end);

    const isAvailable: boolean = await vehicleService.checkAvailability(vehicle, startDate, endDate);

    isAvailable ? res.status(200).json(true) : res.status(200).json(false);;
    return;
    
  } catch (err) {
    next(err);
  }
});

vehicleController.post('/like/:vehicleId', async (req: authenticatedRequest, res: Response, next: NextFunction) => {
  const vehicleId: string = req.params.vehicleId;

  try {

    if (!vehicleId) {
      res.status(400).json({ message: 'Vehicle ID is required' });
      return;
    }

    const userId: string | undefined = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized.' });
      return;
    }

    const updatedVehicle = await vehicleService.likeVehicle(vehicleId, userId);

    if (!updatedVehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return; 
    }

    res.status(200).json({
      message: 'Like updated successfully!',
      likes: updatedVehicle.likes
    });

  } catch (err) {
    next(err);
  }
});

vehicleController.put('/unlike/:vehicleId', async (req: authenticatedRequest, res: Response, next: NextFunction) => {
  const vehicleId: string = req.params.vehicleId;

  try {

    if (!vehicleId) {
      res.status(400).json({ message: 'Vehicle ID is required' });
      return;
    }

    const userId: string | undefined = req.user?._id;

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
      message: 'Like removed successfully!',
      likes: updatedVehicle.likes
    });

  } catch (err) {
    next(err);
  }
});

export default vehicleController;