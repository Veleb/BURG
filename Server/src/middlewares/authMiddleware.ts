import { Response, NextFunction, RequestHandler, Request } from 'express';
import { Document } from 'mongoose';
import jwtp from '../libs/jwtp';
import { authenticatedRequest, TokenPayload } from '../types/requests/authenticatedRequest';
import UserModel from '../models/user';
import { UserFromDB } from '../types/model-types/user-types';
import setAuthTokens from '../utils/setAuthTokens';
import tokenUtil from '../utils/tokenUtil';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  const customReq = req as authenticatedRequest;

  try {
    const accessToken = customReq.cookies?.access_token;
    const refreshToken = customReq.cookies?.refresh_token;
    const csrfToken = customReq.headers['x-csrf-token'];

    if (!accessToken && !refreshToken) {
      customReq.user = undefined;
      customReq.isAuthenticated = false;

      return next();
    }

    if (accessToken) {
      try {
        const decoded = await jwtp.verify(accessToken, ACCESS_TOKEN_SECRET!) as TokenPayload;
        const user = await UserModel.findById(decoded._id)
          .select('tokenVersion isGoogleUser role')
          .lean() as UserFromDB | null;

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
          throw new Error('Token revoked');
        }

        customReq.user = {
          _id: decoded._id,
          accessToken,
          role: user.role,
          tokenVersion: user.tokenVersion,
          isGoogleUser: user.isGoogleUser
        };

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(customReq.method)) {
          if (!csrfToken || !tokenUtil.verifyCsrfToken(csrfToken as string, decoded._id)) {
            res.status(403).json({
              code: 'INVALID_CSRF',
              message: 'Invalid CSRF token'
            });
            return;
          }
        }

        if (customReq.method === 'GET' && customReq.user) {
          const newCsrfToken = tokenUtil.generateCsrfToken(customReq.user._id);
          res.header('X-CSRF-Token', await newCsrfToken); 
        }

        next();
        return;
      } catch (accessError) {
        if ((accessError as Error).name !== 'TokenExpiredError') throw accessError;
      }
    }

    if (refreshToken) {
      const decoded = await jwtp.verify(refreshToken, REFRESH_TOKEN_SECRET!) as TokenPayload;
      const user: (Document & UserFromDB) | null = await UserModel.findById(decoded._id);

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.status(401).json({
          code: 'TOKEN_REVOKED',
          message: 'Session expired. Please log in again.'
        });
        return 
      }

      const newTokenVersion = user.tokenVersion + 1;
      await user.save();
      await (user as Document).save();

      const newAccessToken = await tokenUtil.generateAccessToken(user._id, newTokenVersion);
      const newRefreshToken = await tokenUtil.generateRefreshToken(user._id, newTokenVersion);
      const csrfToken = await tokenUtil.generateCsrfToken(user._id);

      setAuthTokens(res, newAccessToken, newRefreshToken);
      res.header('X-CSRF-Token', csrfToken); 

      customReq.user = {
        _id: user._id,
        accessToken: newAccessToken,
        role: user.role,
        tokenVersion: newTokenVersion,
        isGoogleUser: user.isGoogleUser
      };

      next();
      return; 
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(401).json({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid authentication credentials'
    });
    return 

  } catch (error) {
    console.log(error);
    
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(401).json({
      code: 'AUTH_ERROR',
      message: 'Authentication failed'
    });
    return 
  }
};

export default authMiddleware;

/* 
  Middleware that checks for the presence of an access token and refresh token in the request cookies.

  - If an access token is present, it is verified and user info is added to the request object.
  - If the access token is invalid or expired, the refresh token is verified and a new access token is issued.

  - If only the refresh token is present, a new access token is issued.
  - If the refresh token is invalid or expired, the request is rejected.

  - If neither token is present, the request is rejected.
*/