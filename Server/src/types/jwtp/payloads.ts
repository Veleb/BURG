import { Types } from "mongoose";

export interface payloadInterface {
  _id: Types.ObjectId;
  email: string;
  isGoogleUser: boolean,
  role: string,
  tokenVersion: number,
}

export interface payloadTokens {
  accessToken: string;
  refreshToken: string;
}