import { Router, Request, Response, NextFunction } from "express";
import vehicleService from "../services/vehicleService";

const vehicleController = Router();

vehicleController.get('', async (req: Request, res: Response, next: NextFunction) => {
  try {

    const vehicles = await vehicleService.getAllVehicles();

    res.status(200).json(vehicles);
    return;

  } catch (err) {
    next(err);
  }
})

vehicleController.get('/:vehicleId', async (req: Request, res: Response, next: NextFunction) => {
  const vehicleId = req.params.vehicleId;

  if (!vehicleId) {
    res.status(400).json({ message: 'Vehicle ID is required' });
    return;
  }

  try {
    const vehicle = await vehicleService.getVehicleById(vehicleId);

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

    const startDate = new Date(start);  
    const endDate = new Date(end);

    const isAvailable = await vehicleService.checkAvailability(vehicle, startDate, endDate);

    if (isAvailable) {
      res.status(200).json({ message: 'Vehicle is available' });
    } else {
      res.status(400).json({ message: 'Vehicle is not available during the selected period' });
    }
    
  } catch (err) {
    next(err);
  }
});

export default vehicleController;