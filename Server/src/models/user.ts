import { Schema, model } from "mongoose";
import { UserInterface } from "../types/model-types/user-types";
import bcrypt from 'bcrypt';

const UserSchema = new Schema<UserInterface>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'is invalid'], // regex pattern for email
  },
  password: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
  },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const UserModel = model<UserInterface>('User', UserSchema);

export default UserModel;