import { Response, NextFunction, RequestHandler, Request } from "express";
import { Types } from "mongoose";
import jwtp from "../libs/jwtp";
import { AuthenticatedRequest, TokenPayload } from "../types/requests/authenticatedRequest";
import UserModel from "../models/user";
import { UserFromDB } from "../types/model-types/user-types";
import setAuthTokens from "../utils/setAuthTokens";
import tokenUtil from "../utils/tokenUtil";
import clearAuthTokens from "../utils/clearAuthTokens";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const customReq = req as AuthenticatedRequest;

  try {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;

    if (!accessToken && !refreshToken) {
      customReq.user = undefined;
      customReq.isAuthenticated = false;
      return next();
    }

    if (accessToken) {
      try {
        const decoded = (await jwtp.verify(
          accessToken,
          ACCESS_TOKEN_SECRET!
        )) as TokenPayload;
        const user = (await UserModel.findById(decoded._id)
          .select("tokenVersion isGoogleUser role")
          .lean()) as UserFromDB | null;

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
          throw new Error("Token revoked");
        }

        customReq.user = {
          _id: new Types.ObjectId(decoded._id),
          accessToken,
          role: user.role,
          tokenVersion: user.tokenVersion,
          isGoogleUser: user.isGoogleUser,
        };

        customReq.isAuthenticated = true;

        return next();
      } catch (accessError) {
        if ((accessError as Error).name !== "TokenExpiredError") {
          throw accessError;
        }
      }
    }

    if (refreshToken) {
      try {
        const decoded = (await jwtp.verify(
          refreshToken,
          REFRESH_TOKEN_SECRET!
        )) as TokenPayload;
        const user = await UserModel.findById(decoded._id);

        // if (!user || user.tokenVersion !== decoded.tokenVersion) {
        // clearAuthTokens(res);
        //   res.status(401).json({ code: 'TOKEN_REVOKED', message: 'Session expired. Please log in again.' });
        //   return
        // }

        if (!user || user.tokenVersion !== decoded.tokenVersion) {
          throw new Error("Refresh token revoked");
        }

        // const updatedUser = await UserModel.findByIdAndUpdate(
        //   decoded._id,
        //   { $inc: { tokenVersion: 1 } },
        //   { new: true }
        // );

        // if (!updatedUser) throw new Error("User not found");

        const newAccessToken = await tokenUtil.generateAccessToken(
          user._id,
          user.tokenVersion
        );
        const newRefreshToken = await tokenUtil.generateRefreshToken(
          user._id,
          user.tokenVersion
        );

        // tokenUtil.generateAndStoreCsrfToken(res);

        setAuthTokens(res, newAccessToken, newRefreshToken);

        customReq.user = {
          _id: user._id,
          accessToken: newAccessToken,
          role: user.role,
          tokenVersion: user.tokenVersion,
          isGoogleUser: user.isGoogleUser,
        };

        customReq.isAuthenticated = true;

        return next();
      } catch (refreshError) {
        clearAuthTokens(res);
        res.status(401).json({
          code: "TOKEN_REVOKED",
          message: "Session expired. Please log in again.",
        });
        return;
      }
    }

    clearAuthTokens(res);
    res.status(401).json({
      code: "INVALID_CREDENTIALS",
      message: "Invalid authentication credentials",
    });
    return;
  } catch (error) {
    console.log(error);

    clearAuthTokens(res);
    res.status(401).json({
      code: "AUTH_ERROR",
      message: "Authentication failed",
    });
    return;
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
