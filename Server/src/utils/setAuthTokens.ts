import { Response } from "express";

const setAuthTokens = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });
  res.cookie('auth', accessToken, { httpOnly: true, secure: true, sameSite: 'none' });
};

export default setAuthTokens;