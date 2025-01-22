import { Router } from "express";
import userController from "./controllers/userController";
import vehicleController from "./controllers/vehicleController";

const routes = Router();

routes.use('/users', userController);
routes.use('/vehicles', vehicleController);

export default routes;