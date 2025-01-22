import VehicleModel from "../models/vehicle"
import { VehicleInterface } from "../types/model-types/vehicle-types"

async function getAllVehicles(): Promise<VehicleInterface[]> {
  const vehicles: VehicleInterface[] = await VehicleModel.find();

  return vehicles;
}

async function getVehicleById(vehicleId: string): Promise<VehicleInterface> {
  const vehicle: VehicleInterface | null = await VehicleModel.findById(vehicleId);
  
  if (!vehicle) {
    throw new Error('Vehicle not found'); 
  }

  return vehicle;
}


const vehicleService = {
  getAllVehicles,
  getVehicleById,
  
}

export default vehicleService