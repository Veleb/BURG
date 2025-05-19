import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { expressConfig } from './configs/expressConfig';
import mongooseInit from './configs/mongooseConfig';
import './tasks/rentsCleanupTask'; 
import { v2 as cloudinary } from 'cloudinary';


const app = express();

expressConfig(app);
mongooseInit();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

app.get('/ping', (req, res) => {
  res.status(200).send('OK');
});

const port = (process.env.PROD === "true" ? process.env.PORT : 3030);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export { cloudinary }