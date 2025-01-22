import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export default function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    
    if (res.headersSent) {
      return next(err);
    }
  
    if (err instanceof mongoose.Error) {
      res.status(400).json({ message: "Mongoose error: " + err.message });
    } else if (err.message === "Unauthorized") {
      res.status(401).json({ message: err.message });
    } else {
      res.status(500).json({ message: err.message || "Internal Server Error" });
    }
  }