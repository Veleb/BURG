import { Schema, model, Types } from "mongoose";
import { CertificateInterface } from "../types/model-types/certificate-types";

const CertificateSchema = new Schema<CertificateInterface>(
  {
    redeemed_at: { type: Date },

    isRedeemed: { type: Boolean, default: false },

    user: { type: Types.ObjectId, ref: 'User', required: false },

    code: { type: String, required: true, unique: true },

    issuedTo: { type: String, required: true },

    downloadLink: { type: String, required: true },

    position: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

const CertificateModel = model('Certificate', CertificateSchema, 'certificates');

export default CertificateModel;
