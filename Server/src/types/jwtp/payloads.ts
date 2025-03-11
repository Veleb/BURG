export interface payloadInterface {
  _id: string;
  email: string;
  isGoogleUser: boolean,
  role: string,
  tokenVersion: number,
}

export interface payloadTokens {
  accessToken: string;
  refreshToken: string;
}