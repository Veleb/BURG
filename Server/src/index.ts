import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { expressConfig } from './configs/expressConfig';
import mongooseInit from './configs/mongooseConfig';
// import { v2 as cloudinary } from 'cloudinary';

const app = express();

expressConfig(app);
mongooseInit();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_SECRET,
// });


if (process.env.PROD === 'false') {
  app.listen(3030, () => {
    console.log(`Server running on port ${3030}`);
  });
}

export default app;