import { Response } from "express";

const clearAuthTokens = (res: Response): void => {
  const isProd = process.env.PROD === 'true';

  const sameSite: "none" | "lax" | "strict" | undefined = isProd ? 'none' : 'lax';
  const secure = isProd;

  const cookieOptions = {
    httpOnly: true,
    secure,
    sameSite,
    domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
    path: '/', 
  };

  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', cookieOptions);
};

export default clearAuthTokens;
