import { Schema, model } from "mongoose";
import { Size, Category } from "../types/model-types/enums"; 
import { VehicleInterface } from "../types/model-types/vehicle-types";

const VehicleSchema = new Schema<VehicleInterface>({

  name: { type: String, required: true },
  model: { type: String, required: true },
  capacity: { type: Number, required: true },

  company: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },

  size: { 
    type: String, 
    enum: Object.values(Size), 
    required: true 
  },

  category: { 
    type: String, 
    enum: Object.values(Category), 
    required: true 
  },

  images: { type: [String], required: true },
  pricePerDay: { type: Number, required: true },
  available: { type: Boolean, required: true },

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const VehicleModel = model('Vehicle', VehicleSchema, 'vehicles');

export default VehicleModel;