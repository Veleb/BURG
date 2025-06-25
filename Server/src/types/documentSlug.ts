import { Document, Types } from 'mongoose';

export interface HasSlug extends Document {
  _id: Types.ObjectId;
  slug: string;
}
