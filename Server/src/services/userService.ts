import UserModel from "../models/user";
import bcrypt from 'bcrypt';
import { payloadInterface, payloadTokens } from "../types/jwtp/payloads";
import { RegularUser, UserForAuth, userForLogin, UserFromDB } from "../types/model-types/user-types";
import checkIfUserExists from "../utils/checkIfUserExists";
import jwtp from "../libs/jwtp";
import { Response } from "express";
import { VehicleInterface } from "../types/model-types/vehicle-types";
import { OAuth2Client } from 'google-auth-library';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function getUserById(id: string | undefined): Promise<UserFromDB> { 
  if (!id) throw new Error("Id is required");

  const user = await UserModel.findById(id).select('-password').lean();
  if (!user) throw new Error("User not found");

  return user as unknown as UserFromDB;
}

async function getUserByEmail(email: string | undefined): Promise<UserFromDB> { 
  if (!email) throw new Error("Email is required");

  const user = await UserModel.findOne({ email }).select('-password').lean();

  if (!user) throw new Error("User not found");

  return user as unknown as UserFromDB;
}

async function createUser(user: UserForAuth): Promise<UserFromDB> {
  const isRegularUser = (u: UserForAuth): u is RegularUser => !u.isGoogleUser;
  
  if (isRegularUser(user)) {
    if (!user.password || user.password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    await checkIfUserExists(user);
  }

  const userToCreate = user.isGoogleUser 
    ? { ...user, password: null }
    : user;

  const newUser = await UserModel.create(userToCreate);
  return newUser.toObject() as unknown as UserFromDB;
}

async function loginUser({ email, password }: userForLogin): Promise<payloadTokens> {
  if (!email || !password) {
      throw new Error("Email and password are required!");
  }

  const existingUser = await UserModel.findOne({ email }).lean();
  if (!existingUser) {
      throw new Error("Invalid email or password");
  }

  if (!existingUser.password) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
      throw new Error("Invalid email or password");
  }

  return generateTokens(existingUser as unknown as UserFromDB);
}

async function registerUser(user: UserForAuth): Promise<payloadTokens> {
  await checkIfUserExists(user);  // Check for existing user
  
  const newUser = await createUser(user); // Create new user
  
  return generateTokens(newUser); // Generate and return both tokens
}

const logoutUser = async (userId: string, res: Response) => {
  await UserModel.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.status(200).json({ message: "Logged out successfully" });
};

async function generateTokens(user: UserFromDB): Promise<payloadTokens> {
  const payload: payloadInterface = {
    _id: user._id,
    email: user.email,
    isGoogleUser: user.isGoogleUser,
    role: user.role,
    tokenVersion: user.tokenVersion
  };

  try {
    const accessToken = await jwtp.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const refreshToken = await jwtp.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
  } catch (error) {
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

  if (!user.isGoogleUser && updatedData.password) {
    user.password = await bcrypt.hash(updatedData.password, 10);
  } else if (user.isGoogleUser && updatedData.password) {
    throw new Error("Google users cannot set passwords");
  }

  await UserModel.findByIdAndUpdate(user._id, { tokenVersion: user.tokenVersion });
  return user.toObject() as unknown as UserFromDB;
}

async function handleGoogleAuth(idToken: string) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  
  if (!payload?.email_verified) throw new Error('GOOGLE_EMAIL_UNVERIFIED');
  if (payload.aud !== GOOGLE_CLIENT_ID) throw new Error('INVALID_AUDIENCE');

  const email = payload.email;
  const name = payload.name || payload.given_name || '';

  if (!email || !name) throw new Error('GOOGLE_INSUFFICIENT_DATA');

  let user = await UserModel.findOne({ email });

  if (user && !user.isGoogleUser) throw new Error('EXISTING_EMAIL_ACCOUNT');

  if (!user) {
    const newUser = await UserModel.create({
      email,
      fullName: name,
      isGoogleUser: true,
      role: 'user',
      tokenVersion: 0
    });

    user = newUser;
  }

  user.tokenVersion += 1;
  await user.save(); 

  return generateTokens(user as unknown as UserFromDB);
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
  handleGoogleAuth
  
}

export default UserService;