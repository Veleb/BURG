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

export default vehicleController;