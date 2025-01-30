import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { expressConfig } from './configs/expressConfig';
import mongooseInit from './configs/mongooseConfig';

const app = express();

expressConfig(app);
mongooseInit();

const port = (process.env.PROD === "true" ? process.env.PORT : 3030);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});