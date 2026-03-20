import apiClient from "./api-client";
import type {
  AuthResponse,
  LoginCredentials,
  SignUpCredentials,
  User,
  AuthTokens,
  ApiResponse,
} from "@task-manager/types";

export const authService = {
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/signup",
      credentials,
    );
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data.data;
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>(
      "/auth/refresh",
      { refreshToken },
    );
    return response.data.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post("/auth/logout", { refreshToken });
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },
};
