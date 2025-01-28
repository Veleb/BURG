import { Router } from "express";
import userController from "./controllers/userController";
import vehicleController from "./controllers/vehicleController";
import rentController from "./controllers/rentController";

const routes = Router();

routes.use('/users', userController);
routes.use('/vehicles', vehicleController);
routes.use('/rents', rentController);

export default routes;