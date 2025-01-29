import RentModel from "../models/rent";
import { RentInterface } from "../types/model-types/rent-types";

async function createRent(rentData: RentInterface): Promise<RentInterface> {
  try {

    const rent = await RentModel.create(rentData);

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

const rentService = {
  createRent,
  getRentById,

}

export default rentService;