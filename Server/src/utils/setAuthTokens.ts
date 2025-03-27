import { Response } from "express";

const setAuthTokens = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProd = process.env.PROD === 'true';
  
  const sameSite = isProd ? 'none' : 'lax';
  const secure = isProd; 

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure,          
    sameSite,        
    domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
    maxAge: 30 * 60 * 1000,
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure,          
    sameSite,        
    domain: isProd ? process.env.COOKIE_DOMAIN : undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export default setAuthTokens;