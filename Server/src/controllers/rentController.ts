import { NextFunction, Request, Response, Router } from "express";
import { authenticatedRequest } from "../types/requests/authenticatedRequest";
import UserService from "../services/userService";
import rentService from "../services/rentService";
import { RentInterface, RentInterfaceWithoutUser } from "../types/model-types/rent-types";
import { UserFromDB } from "../types/model-types/user-types";
import vehicleService from "../services/vehicleService";

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

    const isAvailable = await vehicleService.checkAvailability(
      rentData.vehicle._id,
      new Date(rentData.start),
      new Date(rentData.end)
    );

    if (!isAvailable) {
      res.status(400).json({ message: 'Vehicle is not available for the selected dates' });
      return;
    }

    const newRentData: RentInterface = { ...rentData, user, status: 'pending' };
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

rentController.get('/:vehicleId/unavailable-dates', async (req: Request, res: Response, next: NextFunction) => {
  const vehicleId = req.params.vehicleId;

  if (!vehicleId) {
    res.status(400).json( { message: 'Vehicle ID is required' } );
    return;
  }

  try {
    
    const unavailableDates = await rentService.getUnavailableDates(vehicleId);

    if (!unavailableDates) {
      res.status(400).json({ message: 'Unavailable dates not found' });
      return; 
    }

    res.status(200).json(unavailableDates);

    return;
  } catch(err) {
    next(err);
  }
});

rentController.post('/cancel-rent', async (req: Request, res: Response, next: NextFunction) => {
  const { rentId } = req.body;

  if (!rentId) {
    res.status(400).json({ message: 'Rent ID is required.' });
    return; 
  }

  try {

    await rentService.changeRentStatus(rentId, 'canceled');
    res.status(200).json({ message: 'Rent canceled successfully.' });
    
  } catch (error) {
    next(error);
  }
});

export default rentController;
