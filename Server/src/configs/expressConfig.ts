import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authMiddleware from '../middlewares/authMiddleware';
import routes from '../routes';
import errorMiddleware from '../middlewares/errorMiddleware';

export function expressConfig(app: Application): void {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ credentials: true }));
  app.use(cookieParser());
  app.use(authMiddleware);
  app.use(routes);
  app.use(errorMiddleware)
}
