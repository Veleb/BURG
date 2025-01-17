import mongoose from "mongoose";

const DB_URL = process.env.DB_URL_PROD as string;

export default function mongooseInit() {
  mongoose
    .connect(DB_URL)
    .then(() => console.log(`Successfully connected to the DB!`))
    .catch((err) => console.log(`Error while connecting to the DB!`, err));
}