import UserModel from "../models/user";
import bcrypt from 'bcrypt';
import { payloadInterface, payloadTokens } from "../types/jwtp/payloads";
import { UserForAuth, userForLogin, UserFromDB } from "../types/model-types/user-types";
import checkIfUserExists from "../utils/checkIfUserExists";
import jwtp from "../libs/jwtp";
import { Response } from "express";
import { VehicleInterface } from "../types/model-types/vehicle-types";

const JWT_SECRET = process.env.JWT_SECRET as string;

async function getUserById(id: string | undefined): Promise<UserFromDB> { 
  if (!id) throw new Error("Id is required");

  const user = await UserModel.findById(id).select('-password').lean();
  if (!user) throw new Error("User not found");

  return user;
}

async function getUserByEmail(email: string | undefined): Promise<UserFromDB> { 
  if (!email) throw new Error("Email is required");

  const user = await UserModel.findOne({ email }).select('-password').lean();

  if (!user) throw new Error("User not found");

  return user;
}

async function createUser(user: UserForAuth): Promise<UserFromDB> { // create new user

  if (!user) {
      throw new Error("User data is not valid!");
  }

  await checkIfUserExists(user) // check if there is an existing user with the same email or phone number

  const newUser = await UserModel.create(user);

  return newUser.toObject() as UserFromDB;
}

async function loginUser({ email, password }: userForLogin): Promise<payloadTokens> {
  if (!email || !password) {
      throw new Error("Email and password are required!");
  }

  const existingUser = await UserModel.findOne({ email }).lean();
  if (!existingUser) {
      throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
      throw new Error("Invalid email or password");
  }

  return generateTokens(existingUser);
}

async function registerUser(user: UserForAuth): Promise<payloadTokens> {
  await checkIfUserExists(user);  // Check for existing user
  
  const newUser = await createUser(user); // Create new user
  
  return generateTokens(newUser); // Generate and return both tokens
}

const logoutUser = (res: Response) => {
  res.clearCookie('auth'); // Clear access token
  res.clearCookie('refresh_token'); // Clear refresh token
  res.status(200).json({ message: "Logged out successfully" });
};

async function generateTokens(user: UserFromDB): Promise<payloadTokens> {
  const payload: payloadInterface = {
      _id: user._id,
      email: user.email,
  };

  try {
      const accessToken = await jwtp.sign(payload, JWT_SECRET, { expiresIn: '2h' }); // Access token expires in 2 hours
      const refreshToken = await jwtp.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // Refresh token expires in 30 days

      return {
          accessToken,
          refreshToken,
      };
  } catch (error) {
      console.error("Error generating tokens:", error);
      throw new Error('Token generation failed');
  }
}

async function getUserLikedVehicles(userId: string): Promise<VehicleInterface[]> {
  const user = await UserModel.findById(userId).populate<{ likes: VehicleInterface[] }>('likes').lean();
   
  return user?.likes || [];
}

async function updateUser(userId: string, updatedData: Partial<UserForAuth>): Promise<UserFromDB> {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');

  if (updatedData.fullName) user.fullName = updatedData.fullName;
  if (updatedData.email) user.email = updatedData.email;
  if (updatedData.phoneNumber) user.phoneNumber = updatedData.phoneNumber;

  // if (updatedData.password) {
  //     user.password = await bcrypt.hash(updatedData.password, 10);
  // }

  await user.save();
  return user.toObject() as UserFromDB;
}

const UserService = {
  loginUser,
  registerUser,
  logoutUser,
  getUserById,
  getUserByEmail,
  getUserLikedVehicles,
  createUser,
  generateTokens,
  updateUser,
}

export default UserService;