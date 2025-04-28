import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authMiddleware from '../middlewares/authMiddleware';
import routes from '../routes';
import errorMiddleware from '../middlewares/errorMiddleware';
import csrfMiddleware from '../middlewares/csrfMiddleware';
import { postWebhook } from '../controllers/stripeController';


const FRONT_END = (process.env.PROD === 'true') ? process.env.FRONT_END_PROD : process.env.FRONT_END_LOCAL;

const corsOptions = {
  credentials: true,
  origin: FRONT_END, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-CSRF-Token',
    'X-Requested-With'
  ],
  exposedHeaders: [
    'Authorization',
    'X-CSRF-Token',
    'Content-Disposition'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export function expressConfig(app: Application): void {

  app.set('trust proxy', 1);
    
  app.post(
    '/stripe/webhook',
    express.raw({ type: 'application/json' }),
    postWebhook 
  );
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.options('*', cors(corsOptions));
  app.use(cors(corsOptions));

  app.use(authMiddleware);
  // app.use(csrfMiddleware);
  app.use(routes);
  app.use(errorMiddleware);
}