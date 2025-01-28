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

const rentService = {
  createRent,
  
}

export default rentService;