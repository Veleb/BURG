import { Schema, model, Types } from "mongoose";
import { RentInterface } from "../types/model-types/rent-types";

const RentSchema = new Schema<RentInterface>({

  start: {
    type: Date,
    required: true,
  },

  end: {
    type: Date,
    required: true,
  },

  vehicle: [{
    type: Types.ObjectId,
    ref: "Vehicle",
    required: true,
  }],


  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const RentModel = model('Rent', RentSchema, 'rents');

export default RentModel;
