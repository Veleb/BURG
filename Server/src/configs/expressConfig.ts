import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authMiddleware from '../middlewares/authMiddleware';
import routes from '../routes';
import errorMiddleware from '../middlewares/errorMiddleware';
import csrfMiddleware from '../middlewares/csrfMiddleware';
import { postWebhook } from '../controllers/stripeController';
import path from 'path';
import helmet from 'helmet';
import csurf from 'csurf';

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

const csrfProtection = csurf({ cookie: true });


export function expressConfig(app: Application): void {

  app.set('trust proxy', 1);
    
  app.use(helmet());

  app.post(
    '/stripe/webhook',
    express.raw({ type: 'application/json' }),
    postWebhook 
  );
  
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/static', express.static(path.join(__dirname, '../../public')));

  app.options('*', cors(corsOptions));
  app.use(cors(corsOptions));

  app.use(authMiddleware);
  // app.use(csrfMiddleware);
  
  // app.get('/csrf-token', csrfProtection, (req, res) => {
  //   res.json({ csrfToken: req.csrfToken() });
  // });
  
  app.use(routes);
  app.use(errorMiddleware);
}