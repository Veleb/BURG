import UserModel from "../models/user";
import { UserForAuth } from "../types/model-types/user-types";

export default async function checkIfUserExists(user: UserForAuth): Promise<void> {
  const existingUser = await UserModel.findOne({
    $or: [
      { username: user.username },
      { email: user.email || "" },
      { phoneNumber: user.phoneNumber || ""}
    ]
  });

  if (existingUser) {
    if (existingUser.username === user.username) throw new Error("Username is already in use!");
    if (existingUser.email === user.email || user.email === "" ) throw new Error("Email is already registered!");
    if (existingUser.phoneNumber === user.phoneNumber || user.phoneNumber === "" ) throw new Error("Phone number is already registered!");
  }
}