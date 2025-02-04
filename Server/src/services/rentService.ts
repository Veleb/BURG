import RentModel from "../models/rent";
import UserModel from "../models/user";
import VehicleModel from "../models/vehicle";
import { RentInterface } from "../types/model-types/rent-types";

async function createRent(rentData: RentInterface): Promise<RentInterface> {
  try {

    const rent = await RentModel.create(rentData);

    if (rent.user) { 
      await UserModel.findByIdAndUpdate(
        rent.user, 
        { $push: { rents: rent._id } }, 
        { new: true }
      );
    }

    if (rent.vehicle) {
      await VehicleModel.findByIdAndUpdate(
        rent.vehicle,
        { $push: { reserved: rent._id } }, 
        { new: true }
      )
    }

    return rent.toObject();
  } catch (err) {
    throw new Error(`Error creating a rent!`);
  }
}

async function getRentById(rentId: string): Promise<RentInterface | null> {
  try {
    const rent = await RentModel.findById(rentId)
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate('vehicle')
      .lean(); 

    if (!rent) {
      throw new Error('Rent not found');
    }

    return rent as RentInterface; 
  } catch (error) {
    throw new Error(`Error fetching rent.`);
  }
}

async function getUnavailableDates(vehicleId: string): Promise<RentInterface[]> {
  try {
    const reservations: RentInterface[] = await RentModel.find({
      vehicle: vehicleId,
      status: { $ne: "canceled" },
    }).lean();

    return reservations;
  } catch (err) {
    throw new Error(`Error fetching unavailable dates for vehicle: ${err}`);
  }
}

async function changeRentStatus(rentId: string, status: string) {

  try {

    const rent = await RentModel.findByIdAndUpdate(
      rentId,
      { $set: { status: status } },
      { new: true }
    ).lean();


    return rent;

  } catch (err) {
    console.error(`Error confirming a rent! ${err}`)
    throw new Error(`Error confirming a rent!`);
  }

}

const rentService = {
  createRent,
  getRentById,
  getUnavailableDates,
  changeRentStatus,

}

export default rentService;