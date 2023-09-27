import * as jwt from "jsonwebtoken";
export const APP_SECRET="appsecret321";

export interface AuthTokenPayload {
  userId: number;
}

export function decodeAuthHeader(authHeader: String): AuthTokenPayload {
  const token = authHeader.replace("Bearer ", "");
  return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}