import { NextFunction, Request, Response, Router } from "express";
import { authenticatedRequest } from "../types/requests/authenticatedRequest";
import UserService from "../services/userService";
import rentService from "../services/rentService";
import { RentInterface, RentInterfaceWithoutUser } from "../types/model-types/rent-types";
import { UserFromDB } from "../types/model-types/user-types";

const rentController = Router();

rentController.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string | undefined = (req as authenticatedRequest).user?._id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return; 
    }

    const user: UserFromDB = await UserService.getUserById(userId);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return; 
    }

    const rentData: RentInterfaceWithoutUser = req.body;
    
    if (!rentData.start || !rentData.end || !rentData.vehicle) {
      res.status(400).json({ message: 'Missing required rent details (start, end, vehicle)' });
      return; 
    }

    if (new Date(rentData.start) >= new Date(rentData.end)) {
      res.status(400).json({ message: 'Start date must be earlier than end date' });
      return; 
    }

    const newRentData: RentInterface = { ...rentData, user };
    const rent = await rentService.createRent(newRentData);
    
    res.status(201).json(rent);
    return; 
  } catch (error) {
    next(error);
  }
});

rentController.get('/:rentId', async (req: Request, res: Response, next: NextFunction) => {
  
  try {

    const rentId: string = req.params.rentId;

    if (!rentId) {
      res.status(400).json({ message: 'No rent ID provided.' });
    }

    const rent = await rentService.getRentById(rentId);

    res.status(200).json(rent);

  } catch (error) {
    next(error);
  }

});

export default rentController;
