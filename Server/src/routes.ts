import { Router } from "express";
import userController from "./controllers/userController";
import vehicleController from "./controllers/vehicleController";
import rentController from "./controllers/rentController";
import stripeController from "./controllers/stripeController";
import currencyController from "./controllers/currencyController";

const routes = Router();

routes.use('/users', userController);
routes.use('/vehicles', vehicleController);
routes.use('/rents', rentController);
routes.use('/stripe', stripeController);
routes.use('/currency', currencyController);


export default routes;