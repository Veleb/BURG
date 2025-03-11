import { Response } from "express";

const setAuthTokens = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProd = process.env.PROD === 'true';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
    
};

export default setAuthTokens;