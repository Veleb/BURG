import UserModel from "../models/user";
import { UserForAuth } from "../types/model-types/user-types";

export default async function checkIfUserExists(user: UserForAuth): Promise<void> {
  const existingUser = await UserModel.findOne({
    $or: [
      { username: user.username },
      { email: user.email },
      { phone_number: user.phone_number }
    ]
  });

  if (existingUser) {
    if (existingUser.username === user.username) throw new Error("Username is already in use!");
    if (existingUser.email === user.email) throw new Error("Email is already registered!");
    if (existingUser.phone_number === user.phone_number) throw new Error("Phone number is already registered!");
  }
}