import { NextFunction, Request, Response, Router } from "express";
import userService from "../services/userService";
import { UserForAuth } from "../types/model-types/user-types";
import { AuthenticatedRequest } from "../types/requests/authenticatedRequest";
import setAuthTokens from "../utils/setAuthTokens";
import tokenUtil from "../utils/tokenUtil";
import { Types } from "mongoose";
import upload from "../middlewares/upload";
import {
  uploadFilesToCloudinary,
  uploadSingleFileToCloudinary,
} from "../utils/uploadFilesToCloudinary";

const userController = Router();

userController.get(
  "/profile",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: Types.ObjectId | undefined = (req as AuthenticatedRequest)
        .user?._id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await userService.getUserById(userId); // fetch user by id

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
      return;
    } catch (error) {
      next(error);
    }
  }
);

userController.get(
  "/likes",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;
    const userId: Types.ObjectId | undefined = customReq.user?._id;

    try {
      if (!userId) {
        res.status(401).json({ message: "Unauthorized!" });
        return;
      }

      const likedVehicles = await userService.getUserLikedVehicles(userId);

      res.status(200).json(likedVehicles);
      return;
    } catch (err) {
      next(err);
    }
  }
);

userController.get("/csrf-token", (req: Request, res: Response) => {
  res.json({ csrfToken: req.csrfToken() });
});

userController.get(
  "/companies",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;
    const userId: Types.ObjectId | undefined = customReq.user?._id;

    try {
      if (!userId) {
        res.status(401).json({ message: "Unauthorized!" });
        return;
      }

      const companies = await userService.getUserCompanies(userId);

      res.status(200).json(companies);
      return;
    } catch (err) {
      next(err);
    }
  }
);

userController.get(
  "/rents",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;
    const userId: Types.ObjectId | undefined = customReq.user?._id;

    try {
      if (!userId) {
        res.status(401).json({ message: "Unauthorized!" });
        return;
      }

      const rents = await userService.getUserRents(userId);

      res.status(200).json(rents);
      return;
    } catch (err) {
      next(err);
    }
  }
);

userController.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.body as UserForAuth; // get user data from request body

      const { accessToken, refreshToken } = await userService.registerUser(
        user
      ); // create new user
      setAuthTokens(res, accessToken, refreshToken); // set auth cookies

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      next(error);
    }
  }
);

userController.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body; // get email and password from request body

      const { accessToken, refreshToken } = await userService.loginUser({
        email,
        password,
      });
      setAuthTokens(res, accessToken, refreshToken); // set auth cookies

      res.status(200).json({ message: "Logged in successfully" });
      return;
    } catch (error) {
      next(error);
    }
  }
);

userController.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customReq = req as AuthenticatedRequest;
      const userId = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await userService.logoutUser(userId, res);
    } catch (error) {
      next(error);
    }
  }
);

userController.post(
  "/google-auth",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;
      const { user, accessToken, refreshToken } =
        await userService.handleGoogleAuth(idToken);

      //   const csrfToken = await tokenUtil.generateCsrfToken();

      setAuthTokens(res, accessToken, refreshToken);

      res
        // .header('X-CSRF-Token', csrfToken)
        .status(200)
        .json({
          message: "Google authentication successful",
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        });
    } catch (err) {
      if (err instanceof Error && err.message === "EXISTING_EMAIL_ACCOUNT") {
        res.status(409).json({
          code: "EXISTING_EMAIL",
          message: "Email already registered with regular account",
        });
        return;
      }
      next(err);
    }
  }
);

userController.put(
  "/update",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    try {
      const userId: Types.ObjectId | undefined = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const { fullName, email, phoneNumber } = req.body;

      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined;

      const profilePicture =
        files && files["profilePicture"] && files["profilePicture"][0]
          ? files["profilePicture"][0]
          : null;
      const bannerImage =
        files && files["bannerImage"] && files["bannerImage"][0]
          ? files["bannerImage"][0]
          : null;

      let profilePictureUrl: string | undefined;
      let bannerImageUrl: string | undefined;

      if (files?.profilePicture?.[0]) {
        const result = await uploadSingleFileToCloudinary(
          files.profilePicture[0],
          "users/profilePics"
        );
        profilePictureUrl = result.secureUrl;
      }

      if (files?.bannerImage?.[0]) {
        const result = await uploadSingleFileToCloudinary(
          files.bannerImage[0],
          "users/bannerImages"
        );
        bannerImageUrl = result.secureUrl;
      }

      const updatedData = {
        fullName,
        email,
        phoneNumber,
        profilePicture: profilePictureUrl,
        bannerImage: bannerImageUrl,
      };

      const updatedUser: Partial<UserForAuth> = await userService.updateUser(
        userId,
        updatedData
      );

      res
        .status(200)
        .json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  }
);

userController.delete(
  "/delete",
  async (req: Request, res: Response, next: NextFunction) => {
    const customReq = req as AuthenticatedRequest;

    try {
      const userId: Types.ObjectId | undefined = customReq.user?._id;

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      await userService.deleteUser(userId);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

userController.get(
  "/csrf-token",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const csrfToken = tokenUtil.generateCsrfToken();
      res.status(200).json({ csrfToken });
    } catch (error) {
      next(error);
    }
  }
);

userController.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();

      if (!users) {
        res.status(404).json({ message: "No users found" });
        return;
      }

      res.status(200).json(users);
      return;
    } catch (error) {
      next(error);
    }
  }
);

userController.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: Types.ObjectId | undefined = new Types.ObjectId(
        req.params.id
      );

      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const user = await userService.getUserById(userId); // fetch user by id

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
      return;
    } catch (error) {
      next(error);
    }
  }
);

export default userController;
