import { Response } from "express";

const setAuthTokens = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProd = process.env.PROD === 'true';
  const sameSitePolicy = ( isProd ? 'none' : 'lax' );

  res.cookie('auth', accessToken, {
    httpOnly: true, 
    secure: isProd, 
    sameSite: sameSitePolicy, 
    maxAge: 1000 * 60 * 15,
  });

  res.cookie('refresh_token', refreshToken, {
      httpOnly: true, 
      secure: isProd, 
      sameSite: sameSitePolicy, 
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    
};

export default setAuthTokens;