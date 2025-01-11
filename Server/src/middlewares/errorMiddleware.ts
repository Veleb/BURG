import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export default function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof mongoose.Error) {
      res.status(400).send({ message: "Mongoose error: " + err.message });
  } else if (err.message === "Unauthorized") {
      res.status(401).send({ message: err.message });
  } else {
      res.status(500).send({ message: err.message || "Internal Server Error" });
  }
}
