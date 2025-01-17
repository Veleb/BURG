import { Request, Response } from 'express';
import userService from '../services/userService';
import { UserForAuth } from '../types/model-types/user-types';
import setAuthTokens from '../utils/setAuthTokens';
import { authenticatedRequest } from '../types/requests/authenticatedRequest';

export async function getUserProfile(req: authenticatedRequest, res: Response) {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function registerUser(req: Request, res: Response) {
  try {
    const user: UserForAuth = req.body;
    const { accessToken, refreshToken } = await userService.registerUser(user);

    setAuthTokens(res, accessToken, refreshToken);
    return res.status(201).json({ status: 'success', message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const { accessToken, refreshToken } = await userService.loginUser({
      username,
      password,
    });

    setAuthTokens(res, accessToken, refreshToken);
    return res.status(200).json({ status: 'success', message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function logoutUser(req: Request, res: Response) {
  try {
    await userService.logoutUser(req, res);
    return res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const userController = {
  logoutUser,
  loginUser,
  registerUser,
  getUserById,
  getUserProfile,
};

export default userController;
