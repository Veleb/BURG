import { NextFunction, Request, Response, Router } from 'express';
import userService from '../services/userService';
import { UserForAuth } from '../types/model-types/user-types';
import { authenticatedRequest } from '../types/requests/authenticatedRequest';
import setAuthTokens from '../utils/setAuthTokens';
import { OAuth2Client } from 'google-auth-library';
import tokenUtil from '../utils/tokenUtil';

const GOOGLECLIENTID = process.env.GOOGLE_CLIENT_ID as string;

const userController = Router();
const client = new OAuth2Client(GOOGLECLIENTID);

userController.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId: string | undefined = (req as authenticatedRequest).user?._id;
        
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await userService.getUserById(userId); // fetch user by id

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
        return;
    } catch (error) {
        next(error);
    }
});

userController.get('/likes', async (req: Request, res: Response, next: NextFunction) => {

    const customReq = req as authenticatedRequest;
    const userId: string | undefined = customReq.user?._id;

    try {
        if (!userId) {
            res.status(401).json({ message: "Unauthorized!" })
            return;
        }

        const likedVehicles = await userService.getUserLikedVehicles(userId);

        res.status(200).json(likedVehicles);
        return;

    } catch (err) {
        next(err)
    }
})

userController.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const user = await userService.getUserById(id); // fetch user by id

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
        return;
    } catch (error) {
        next(error);
    }
});

userController.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.body as UserForAuth; // get user data from request body
        
        const { accessToken, refreshToken } = await userService.registerUser(user); // create new user
        setAuthTokens(res, accessToken, refreshToken); // set auth cookies
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
});

userController.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body; // get email and password from request body
       
        const { accessToken, refreshToken } = await userService.loginUser({ email, password }); 
        setAuthTokens(res, accessToken, refreshToken); // set auth cookies 

        res.status(200).json({ message: 'Logged in successfully' });
        return;
    } catch (error) {
        next(error);
    }
});

userController.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customReq = req as authenticatedRequest;
      const userId = customReq.user?._id;
      
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
  
      await userService.logoutUser(userId, res);
    } catch (error) {
      next(error);
    }
  });

  userController.post('/google-auth', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;
      const { 
        user, 
        accessToken, 
        refreshToken 
      } = await userService.handleGoogleAuth(idToken);
      
      const csrfToken = await tokenUtil.generateCsrfToken(user._id);
      
      setAuthTokens(res, accessToken, refreshToken);
      
      res
        .header('X-CSRF-Token', csrfToken)
        .status(200)
        .json({ 
          message: 'Google authentication successful',
          user: {
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          }
        });
    } catch (err) {
      if (err instanceof Error && err.message === 'EXISTING_EMAIL_ACCOUNT') {
        res.status(409).json({
          code: 'EXISTING_EMAIL',
          message: 'Email already registered with regular account'
        });
        return;
      }
      next(err);
    }
});

userController.put('/update', async (req: Request, res: Response, next: NextFunction) => {

    const customReq = req as authenticatedRequest
    
    try {
        const userId: string | undefined = customReq.user?._id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const updatedData = customReq.body as Partial<UserForAuth>;

        const updatedUser = await userService.updateUser(userId, updatedData);

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        next(error);
    }
});

export default userController;
