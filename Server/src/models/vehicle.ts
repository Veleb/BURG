import { Schema, model, Types } from "mongoose";
import { Size, Category } from "../types/model-types/enums"; 
import { VehicleInterface } from "../types/model-types/vehicle-types";
import { RentInterface } from "../types/model-types/rent-types";  // Import RentInterface

const VehicleSchema = new Schema<VehicleInterface>({
  name: { type: String, required: true },
  model: { type: String, required: true },
  capacity: { type: Number, required: true },

  company: { 
    type: Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },

  reserved: [{
    type: Types.ObjectId, 
    ref: 'Rent', 
    required: true 
  }],

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
