import { NextFunction, Request, Response, Router } from 'express';
import userService from '../services/userService';
import { UserForAuth } from '../types/model-types/user-types';
import { authenticatedRequest } from '../types/requests/authenticatedRequest';
import setAuthTokens from '../utils/setAuthTokens';

const userController = Router();

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

userController.get('/likes', async (req: authenticatedRequest, res: Response, next: NextFunction) => {
    const userId: string | undefined = req.user?._id;
    
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

userController.post('/logout', async (req: authenticatedRequest, res: Response, next: NextFunction) => {
    try {
        userService.logoutUser(res); // logout user
        res.status(200).json({ message: 'Logged out successfully' });
        return;
    } catch (error) {
        next(error);
    }
});


export default userController;
