import { Schema, model, Types } from "mongoose";
import { Size, Category } from "../types/model-types/enums"; 
import { MachineryInterface } from "../types/model-types/machinery-types";

const MachinerySchema = new Schema<MachineryInterface>({

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
    capacity: { type: Number, required: true },
    size: { type: String, enum: Object.values(Size), required: true },
    images: { type: [String], required: true },
    category: { type: String, enum: Object.values(Category), required: true },
    pricePerDay: { type: Number, required: true },
    pricePerKm: { type: Number, required: true },
    year: { type: Number, required: true },
  },

  available: { type: Boolean, required: true },

  likes: [{ type: Types.ObjectId, ref: "User" }],

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

MachinerySchema.index({ "details.category": 1 });
MachinerySchema.index({ "details.pricePerDay": 1 });
MachinerySchema.index({ likes: 1 });

const MachineryModel = model('Machinery', MachinerySchema);

export default MachineryModel;
