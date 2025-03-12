import jwtp from "../libs/jwtp";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
const CSRF_TOKEN_SECRET = process.env.CSRF_TOKEN_SECRET as string;

const generateAccessToken = (userId: string, tokenVersion: number) => {
  return jwtp.sign(
    { _id: userId, tokenVersion },
    ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId: string, tokenVersion: number) => {
  return jwtp.sign(
    { _id: userId, tokenVersion },
    REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' }
  );
};

const generateCsrfToken = (userId: string) => {
  return jwtp.sign(
    { _id: userId },
    CSRF_TOKEN_SECRET!,
    { expiresIn: '15m' }
  );
};

const verifyCsrfToken = async (token: string, userId: string) => {
  try {
    const decoded = await jwtp.verify(token, CSRF_TOKEN_SECRET!) as { _id: string };
    return decoded._id === userId;
  } catch {
    return false;
  }
};

const tokenUtil = {
  generateAccessToken,
  generateRefreshToken,
  generateCsrfToken,
  verifyCsrfToken
}

export default tokenUtil;