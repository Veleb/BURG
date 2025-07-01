import { Router } from "express";
import userController from "./controllers/userController";
import vehicleController from "./controllers/vehicleController";
import rentController from "./controllers/rentController";
import stripeController from "./controllers/stripeController";
import currencyController from "./controllers/currencyController";
import companyController from "./controllers/companyController";
import TransactionController from "./controllers/transactionController";
import certificateController from "./controllers/certificateController";
import phonepeController from "./controllers/phonepeController";
import { rateLimiterMiddleware } from "./middlewares/rateLimiterMiddleware";

const routes = Router();

routes.use('/users', userController);
routes.use('/vehicles', vehicleController);
routes.use('/rents', rentController);
routes.use('/stripe', stripeController);
routes.use('/currency', currencyController);
routes.use('/companies', companyController);
routes.use('/transactions', TransactionController);
routes.use('/certificates', certificateController);
routes.use('/phonepe', rateLimiterMiddleware, phonepeController);

export default routes;