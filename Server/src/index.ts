import express from 'express';
import userController from './controllers/userController';
import { expressConfig } from './configs/expressConfig';
import mongooseInit from './configs/mongooseConfig';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

expressConfig(app);
mongooseInit();

// const PORT = process.env.PORT || 3030;
// app.listen(PORT, () => {
//   console.log(`Server running on port http://localhost:${PORT}`);
// });
