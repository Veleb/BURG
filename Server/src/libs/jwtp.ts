import jwt, { JwtPayload, VerifyOptions, SignOptions } from 'jsonwebtoken';

async function sign(
  payload: JwtPayload,
  secret: string,
  options: SignOptions = {}
): Promise<string> {
  try {
    return jwt.sign(payload, secret, options);
  } catch (error) {
    throw new Error(`Failed to sign token: ${(error as Error).message}`);
  }
}

async function verify(
  token: string,
  secret: string,
  options: VerifyOptions = {}
): Promise<JwtPayload> {
  try {
    return jwt.verify(token, secret, options) as JwtPayload;
  } catch (error) {
    throw new Error(`Failed to verify token: ${(error as Error).message}`);
  }
}


const jwtp = {
  sign,
  verify,
  decode: jwt.decode,
}

export default jwtp;
