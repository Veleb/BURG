import mongoose from "mongoose";   

const DB_URL = (process.env.PROD === "true") ? process.env.DB_URL_PROD as string : process.env.DB_URL_LOCAL as string;

export default async function mongooseInit() {
  await import("../models"); 
  mongoose
    .connect(DB_URL)
    .then(() => {
      console.log(`Successfully connected to the DB!`);
    })
    .catch((err) => console.log(`Error while connecting to the DB!`, err));
}