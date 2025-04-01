import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { expressConfig } from './configs/expressConfig';
import mongooseInit from './configs/mongooseConfig';

async function initializeApp() {
  const app = express();
  
  try {
    expressConfig(app);

    await mongooseInit();

    return app;
  } catch (error) {
    console.error("Application initialization failed:", error);
    process.exit(1);
  }
}

export default initializeApp();