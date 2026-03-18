export interface TokenPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}
