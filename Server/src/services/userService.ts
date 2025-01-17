import UserModel from "../models/user";
import bcrypt from 'bcrypt';
import { payloadInterface, payloadTokens } from "../types/jwtp/payloads";
import { UserForAuth, userForLogin, UserFromDB } from "../types/model-types/user-types";
import checkIfUserExists from "../utils/checkIfUserExists";
import jwtp from "../libs/jwtp";
import { authenticatedRequest } from "../types/requests/authenticatedRequest";
import { Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET as string;

async function getUserById(id: string | undefined): Promise<UserFromDB> { 
  if (!id) throw new Error("Id is required");

  const user = await UserModel.findById(id).select('-password').lean();
  if (!user) throw new Error("User not found");

  return user;
}

async function createUser(user: UserForAuth): Promise<UserFromDB> { // create new user

  if (!user) {
      throw new Error("User data is not valid!");
  }

  await checkIfUserExists(user) // check if there is an existing user with the same username, email or phone number

  const newUser = await UserModel.create(user);

  return newUser as UserFromDB;
}

async function loginUser({ username, password }: userForLogin): Promise<payloadTokens> {
  if (!username || !password) {
      throw new Error("Username and password are required!");
  }

  const existingUser = await UserModel.findOne({ username });
  if (!existingUser) {
      throw new Error("Invalid username or password");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
      throw new Error("Invalid username or password");
  }

  return generateTokens(existingUser);
}

async function registerUser(user: UserForAuth): Promise<payloadTokens> {
  await checkIfUserExists(user);  // Check for existing user
  
  const newUser = await createUser(user); // Create new user
  
  return generateTokens(newUser); // Generate and return both tokens
}

const logoutUser = (req: authenticatedRequest, res: Response) => {
  res.clearCookie('auth'); // Clear access token
  res.clearCookie('refresh_token'); // Clear refresh token
  res.status(200).json({ message: "Logged out successfully" });
};


async function generateTokens(user: UserFromDB): Promise<payloadTokens> {
  const payload: payloadInterface = {
      _id: user._id,
      username: user.username,
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

const UserService = {
  loginUser,
  registerUser,
  logoutUser,
  getUserById,
}

export default UserService;