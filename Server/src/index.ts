import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import { expressConfig } from './configs/expressConfig';
import mongooseInit from './configs/mongooseConfig';
import serverless from 'serverless-http'

const app = express();

expressConfig(app);
mongooseInit();

// const PORT = process.env.PORT || 3030;
// app.listen(PORT, () => {
//   console.log(`Server running on port http://localhost:${PORT}`);
// });

module.exports.handler = serverless(app);