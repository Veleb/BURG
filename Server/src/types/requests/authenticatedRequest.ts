import { Request } from 'express';
import { Types } from 'mongoose';

export interface authenticatedRequest extends Request {
  req: { _id: string; role: string; tokenVersion: number; isGoogleUser: boolean; };
  isAuthenticated?: boolean;
  user?: {
    _id: Types.ObjectId;
    accessToken: string;
    role: string;
    tokenVersion: number;
    isGoogleUser: boolean;
  };
}

export interface TokenPayload {
  _id: string;
  tokenVersion: number;
}