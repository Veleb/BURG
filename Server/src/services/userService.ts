import UserModel from "../models/user";
import bcrypt from 'bcrypt';
import { payloadInterface, payloadTokens } from "../types/jwtp/payloads";
import { RegularUser, UserForAuth, userForLogin, UserForUpdate, UserFromDB, UserInterface } from "../types/model-types/user-types";
import checkIfUserExists from "../utils/checkIfUserExists";
import jwtp from "../libs/jwtp";
import { Response } from "express";
import { VehicleInterface } from "../types/model-types/vehicle-types";
import { OAuth2Client } from 'google-auth-library';
import { CompanyInterface } from "../types/model-types/company-types";
import { RentInterface } from "../types/model-types/rent-types";
import RentModel from "../models/rent";
import VehicleModel from "../models/vehicle";
import CompanyModel from "../models/company";
import { Types } from "mongoose";
import { customAlphabet } from 'nanoid';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


const generateCertificateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);

async function getUserById(id: Types.ObjectId | undefined): Promise<UserFromDB> { 
  if (!id) throw new Error("Id is required");

  const user = await UserModel.findById(id).select('-password').lean();
  if (!user) throw new Error("User not found");

  return user as UserFromDB;
}

async function getUsers(): Promise<UserFromDB[]> { 
  
  const users = await UserModel.find().select('-password').lean()

  if (!users) {
    throw new Error("Users not found!");
  }

  return users as UserFromDB[];
}


async function getUserByEmail(email: string | undefined): Promise<UserFromDB> { 
  if (!email) throw new Error("Email is required");

  const user = await UserModel.findOne({ email }).select('-password').lean();

  if (!user) throw new Error("User not found");

  return user as UserFromDB;
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

  if (!existingUser.password) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
      throw new Error("Invalid email or password");
  }

  return generateTokens(existingUser as UserFromDB);
}

async function registerUser(user: UserForAuth): Promise<payloadTokens> {
  await checkIfUserExists(user);  
  
  const newUser = await createUser(user); 
  
  return generateTokens(newUser); 
}

const logoutUser = async (userId: Types.ObjectId, res: Response) => {
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

async function getUserLikedVehicles(userId: Types.ObjectId): Promise<VehicleInterface[]> {
  const user = await UserModel.findById(userId).populate<{ likes: VehicleInterface[] }>('likes').lean();
   
  return user?.likes || [];
}

async function getUserCompanies(userId: Types.ObjectId): Promise<CompanyInterface[]> {
  const user = await UserModel.findById(userId).populate<{ companies: CompanyInterface[] }>('companies').lean();
   
  return user?.companies || [];
}

async function getUserRents(userId: Types.ObjectId): Promise<RentInterface[]> {
  const user = await UserModel.findById(userId)
    .populate({
      path: 'rents',
      populate: {
        path: 'vehicle'
      }
    })
    .lean();

   
  return (user?.rents as RentInterface[]) || [];
}

async function updateUser(userId: Types.ObjectId, updatedData: Partial<UserForUpdate>): Promise<UserFromDB> {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error('User not found');

  if (updatedData.fullName) user.fullName = updatedData.fullName;
  if (updatedData.email) user.email = updatedData.email;
  if (updatedData.phoneNumber) user.phoneNumber = updatedData.phoneNumber;

  if (updatedData.certificateDownloadLink !== undefined) {
    const isLinkChanged = updatedData.certificateDownloadLink !== user.certificateDownloadLink;
    user.certificateDownloadLink = updatedData.certificateDownloadLink;

    if (isLinkChanged && updatedData.certificateDownloadLink !== '') {
      user.certificateCode = generateCertificateCode();
    }
  }

  if (!user.isGoogleUser && updatedData.password) {
    user.password = updatedData.password;
  } else if (user.isGoogleUser && updatedData.password) {
    throw new Error('Google users cannot set passwords');
  }

  await user.save();
  return user.toObject() as UserFromDB;
}


async function deleteUser(userId: Types.ObjectId): Promise<void> {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  await RentModel.deleteMany({ _id: { $in: user.rents } });

  await VehicleModel.updateMany(
    { _id: { $in: user.likes } },
    { $pull: { likes: user._id } }
  );

  await CompanyModel.updateMany(
    { _id: { $in: user.companies } },
    { $pull: { employees: user._id } } 
  );

  await UserModel.findByIdAndDelete(userId);
}

async function handleGoogleAuth(idToken: string): Promise<{ 
  user: UserFromDB, 
  accessToken: string, 
  refreshToken: string,
}> {
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

  const { accessToken, refreshToken } = await generateTokens(user as UserFromDB);

  return {
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isGoogleUser: user.isGoogleUser,
      tokenVersion: user.tokenVersion,
      password: null
    } as unknown as UserFromDB,
    accessToken,
    refreshToken,
  };
}

async function promoteUserStatus(userId: Types.ObjectId, userStatus: "user" | "host"): Promise<UserInterface> {
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { role: userStatus },
    { new: true }
  );
  if (!updatedUser) throw new Error("User not found");

  return updatedUser;
}

async function updateDataAfterPayment(
  userId: Types.ObjectId,
  rentalData: RentInterface,
  sessionId: string,
  referralCode?: string
): Promise<{ status: string; rental: RentInterface; user: any }> {
  try {

    // fetch the user and the rental respectively

    const [user, rental] = await Promise.all([
      UserModel.findById(userId),
      RentModel.findById(rentalData._id)
    ]); 

    // validate the user and rental

    if (!user) throw new Error(`User ${userId} not found`);
    if (!rental) throw new Error(`Rental ${rentalData._id} not found`);

    if (!rental.user._id.equals(userId)) {
      throw new Error('User does not own this rental');
    }
    if (rental.status !== 'pending') {
      throw new Error(`Rental already in ${rental.status} state`);
    }

    let referralBonus = 0;

    if (referralCode) {
      const referrer = await UserModel.findOne({ referralCode }); // fetch the referrer by referral code

      if (referrer) {
        const isSelfReferral = referrer._id.equals(userId);
        const isCodeBlacklisted = user.disallowedReferralCodes.includes(referralCode);

        if (!isSelfReferral && !isCodeBlacklisted) { // here we check if the referrer is not the user themselves and if the code is not blacklisted
          referrer.credits += 5; // we add 5 credits to the referrer
          await referrer.save();

          user.disallowedReferralCodes.push(referralCode); // we add the referral code to the user's disallowed codes
          referralBonus = 5;
        }
      }
    }

    // update the rental status to confirmed and apply the referral bonus
    
    const updatedRental = await RentModel.findByIdAndUpdate(
      rental._id,
      {
        status: 'confirmed',
        paymentSessionId: sessionId,
        $inc: { 'appliedDiscounts.referral': referralBonus }
      },
      { new: true }
    );

    if (!updatedRental) {
      throw new Error('Updated rental not found');
    }

    // Update user
    const updateUserData: any = {
      $addToSet: { rentalHistory: rental._id },
      $inc: { 
        credits: -rentalData.appliedDiscounts.creditsUsed,
        creditsUsed: -rentalData.appliedDiscounts.creditsUsed 
      }
    };

    if (referralCode && referralCode.trim()) {
      updateUserData.$push = { disallowedReferralCodes: referralCode.trim() };
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateUserData,
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Updated user not found');
    }

    return {
      status: 'success',
      rental: updatedRental,
      user: updatedUser
    };

  } catch (error) {
    console.error('Error in updateDataAfterPayment:', error);
    throw new Error('Payment update failed');
  }
}


const UserService = {
  loginUser,
  registerUser,
  logoutUser,
  getUserById,
  getUserByEmail,
  getUserLikedVehicles,
  getUserCompanies,
  getUserRents,
  createUser,
  generateTokens,
  updateUser,
  deleteUser,
  handleGoogleAuth,
  promoteUserStatus,
  updateDataAfterPayment,
  getUsers,
  
}

export default UserService;