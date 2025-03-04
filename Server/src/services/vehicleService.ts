import RentModel from "../models/rent";
import UserModel from "../models/user";
import VehicleModel from "../models/vehicle"
import { VehicleInterface } from "../types/model-types/vehicle-types"

async function getAllVehicles(): Promise<VehicleInterface[]> {
  const vehicles: VehicleInterface[] = await VehicleModel.find().lean();

  for (const vehicle of vehicles) {
    vehicle.available = await checkAvailabilityToday(vehicle._id.toString());

    await VehicleModel.findByIdAndUpdate(vehicle._id, { available: vehicle.available }, { new: true });
  }

  return vehicles;
}

async function getVehicleById(vehicleId: string): Promise<VehicleInterface> {
  const vehicle = await VehicleModel.findById(vehicleId)
    .populate('company')
    .populate('likes')
    .lean();
  
  if (!vehicle) {
    throw new Error('Vehicle not found'); 
  }

  return vehicle;
}

async function checkAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean> {
  const utcStart = new Date(startDate.toISOString());
  const utcEnd = new Date(endDate.toISOString());

  if (utcStart >= utcEnd) return false;

  const conflict = await RentModel.findOne({
    vehicle: vehicleId,
    status: { $in: ['confirmed', 'pending', 'active'] },
    $nor: [
      { end: { $lte: utcStart } },
      { start: { $gte: utcEnd } }
    ]
  }).lean();

  return !conflict;
}

async function checkAvailabilityToday(vehicleId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const existingReservation = await RentModel.findOne({
    vehicle: vehicleId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      { start: { $lt: tomorrow }, end: { $gt: today } },
      { start: { $lte: today }, end: { $gte: tomorrow } }
    ],
  }).lean();

  const isAvailable = !existingReservation;

  await VehicleModel.findByIdAndUpdate(vehicleId,
    { $set: { available: isAvailable } },
    { new: true }
  );

  return isAvailable;
}

async function likeVehicle(vehicleId: string, userId: string) {

  const updatedVehicle = await VehicleModel.findByIdAndUpdate(
    vehicleId,
    { $addToSet: { likes: userId } },
    { new: true, select: "likes" } 
  );

  await UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { likes: vehicleId } },
    { new: true }
  );

  return updatedVehicle;
}

async function removeLikeVehicle(vehicleId: string, userId: string) {
  const updatedVehicle = await VehicleModel.findByIdAndUpdate(
    vehicleId,
    { $pull: { likes: userId } },
    { new: true, select: "likes" }
  );

  await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { likes: vehicleId } },
    { new: true }
  );


  return updatedVehicle;
}



const vehicleService = {
  getAllVehicles,
  getVehicleById,
  checkAvailability,
  likeVehicle,
  removeLikeVehicle,

}

export default vehicleService