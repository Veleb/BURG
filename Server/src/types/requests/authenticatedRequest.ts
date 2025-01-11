import { Request } from 'express';

export interface authenticatedRequest extends Request {
  isAuthenticated?: boolean;
  user?: {
    _id: string;
    username: string;
    accessToken: string;
  };
}
