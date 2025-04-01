import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;

export default async function mongooseInit() {
  if (cachedConnection) {
    console.log("Using existing DB connection");
    return cachedConnection;
  }

  const DB_URL = process.env.PROD === "true" 
    ? process.env.DB_URL_PROD!
    : process.env.DB_URL_LOCAL!;

  try {
    const connection = await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1
    });
    
    console.log(`Connected to MongoDB: ${connection.connection.host}`);
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error("DB connection failed:", error);
    throw error;
  }
}