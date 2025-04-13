import { Types } from "mongoose";
import jwtp from "../libs/jwtp";
import { Request, Response } from "express";
import { nanoid } from 'nanoid';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

const generateAccessToken = (userId: Types.ObjectId, tokenVersion: number) => {
  return jwtp.sign(
    { _id: userId, tokenVersion },
    ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId: Types.ObjectId, tokenVersion: number) => {
  return jwtp.sign(
    { _id: userId, tokenVersion },
    REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' }
  );
};

const generateCsrfToken = (): string => {
  return nanoid(32);
};

const generateAndStoreCsrfToken = (res: Response): string => {
  const csrfToken = generateCsrfToken();

  res.cookie('csrf_token', csrfToken, {
    httpOnly: true,      
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict',
  });

  res.setHeader('X-CSRF-Token', csrfToken);

  return csrfToken;
};

const verifyCsrfToken = (token: string, req: Request): boolean => {
  const csrfTokenFromCookie = req.cookies['csrf_token'];

  return csrfTokenFromCookie === token;
};

const tokenUtil = {
  generateAccessToken,
  generateRefreshToken,
  generateCsrfToken,
  generateAndStoreCsrfToken,
  verifyCsrfToken
}

export default tokenUtil;
