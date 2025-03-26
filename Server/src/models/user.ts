import { Schema, model, Types } from "mongoose";
import { UserInterface } from "../types/model-types/user-types";
import bcrypt from 'bcrypt';

const UserSchema = new Schema<UserInterface>({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined,  
    validate: {
      validator: function(v: string | undefined) {
        return v === undefined || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  isGoogleUser: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0, required: true },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser;
    }
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined, 
    validate: {
      validator: function (v: string | undefined) {
        return v === undefined || 
               v === "" || 
               /^\+?[1-9]\d{7,14}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid international phone number!`,
    },
  },
  rents: [{
    ref: "Rent",
    required: true,
    type: Types.ObjectId,
  }],
  likes: [{
    ref: "Vehicle",
    type: Types.ObjectId,
  }],
  role: {
    type: String,
    enum: ['user', 'admin', 'host'],
    default: 'user'
  },
  companies: [{
    ref: "Company",
    type: Types.ObjectId,
  }]
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

UserSchema.pre('save', async function(next) {
  if (this.phoneNumber === "") {
    this.phoneNumber = undefined;
  }

  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  next();
});

const UserModel = model<UserInterface>('User', UserSchema, 'users');
export default UserModel;