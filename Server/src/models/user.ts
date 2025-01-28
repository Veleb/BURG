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
    default: "",  
    validate: {
      validator: function(v: string) {
        return v === "" || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },

  password: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    default: "",
    validate: {
      validator: function (v: string) {
        return v === "" || /\d{10}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },

  rents: [{
    ref: "Rent",
    required: true,
    type: Types.ObjectId,
  }],

}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const UserModel = model<UserInterface>('User', UserSchema, 'users');

export default UserModel;