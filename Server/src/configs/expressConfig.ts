import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authMiddleware from '../middlewares/authMiddleware';
import routes from '../routes';
import errorMiddleware from '../middlewares/errorMiddleware';

const FRONT_END = process.env.FRONT_END_PROD

export function expressConfig(app: Application): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ 
    credentials: true,
    origin: FRONT_END,
    methods: 'GET,POST,PUT,DELETE',
  }));
  app.use(cookieParser());
  app.use(authMiddleware);
  app.use(routes);
  app.use(errorMiddleware)
}
