import { Schema, model, Types } from "mongoose";
import { Size, Category } from "../types/model-types/enums"; 
import { VehicleInterface } from "../types/model-types/vehicle-types";

const VehicleSchema = new Schema<VehicleInterface>({
  reserved: [{
    type: Types.ObjectId, 
    ref: 'Rent'
  }],

  company: { 
    ref: 'Company', 
    type: Types.ObjectId, 
    required: true,
  },

  details: {
    name: { type: String, required: true },
    model: { type: String, required: true },
    size: { type: String, enum: Object.values(Size) },
    images: { type: [String], default: [] },
    vehicleRegistration: { type: [String], default: [] },
    category: { type: String, enum: Object.values(Category) },
    pricePerDay: { type: Number, required: true, min: 0 },
    pricePerKm: { type: Number, required: true, min: 0 },
    year: { type: Number, min: 1886 },
    engine: { type: String },
    power: { type: String },
    gvw: { type: Number, min: 0 },
    fuelTank: { type: Number, min: 0 },
    tyres: { type: Number, default: 4, min: 2 },
    mileage: { type: Number, min: 0 },
    chassisType: { type: String },
    capacity: { type: Number, min: 0 },
    identificationNumber: { type: String, required: true ,unique: true }
  },

  available: { type: Boolean, required: true, default: true },

  likes: [{ type: Types.ObjectId, ref: "User" }],

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

VehicleSchema.index({ "details.category": 1 });
VehicleSchema.index({ "details.pricePerDay": 1 });
VehicleSchema.index({ likes: 1 });
VehicleSchema.index({ available: 1 }); 

const VehicleModel = model('Vehicle', VehicleSchema);

export default VehicleModel;
