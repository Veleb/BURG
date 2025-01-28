import RentModel from "../models/rent";
import VehicleModel from "../models/vehicle"
import { VehicleInterface } from "../types/model-types/vehicle-types"

async function getAllVehicles(): Promise<VehicleInterface[]> {
  const vehicles: VehicleInterface[] = await VehicleModel.find().lean();

  return vehicles;
}

async function getVehicleById(vehicleId: string): Promise<VehicleInterface> {
  const vehicle: VehicleInterface | null = await VehicleModel.findById(vehicleId).lean();
  
  if (!vehicle) {
    throw new Error('Vehicle not found'); 
  }

  return vehicle;
}

async function checkAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean> {
  if (startDate >= endDate) {
    return false;
  }
  const existingReservation = await RentModel.findOne({
    vehicle: vehicleId,
    $or: [
      { start: { $lt: endDate }, end: { $gt: startDate } },
      { start: { $gte: startDate, $lt: endDate } },
      { end: { $gt: startDate, $lte: endDate } }
    ],
  }).lean();
  
  return !existingReservation;
}


const vehicleService = {
  getAllVehicles,
  getVehicleById,
  checkAvailability,

}

export default vehicleService