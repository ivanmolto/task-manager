"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { authService, getErrorMessage } from "@/services";
import { useAuthStore } from "@/stores";
import type { LoginCredentials, SignUpCredentials } from "@task-manager/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    isAuthenticated,
    isLoading,
    setAuth,
    logout: clearAuth,
    refreshToken,
  } = useAuthStore();

  // Get current user query
  const userQuery = useQuery({
    queryKey: ["user"],
    queryFn: authService.getMe,
    enabled: isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: (credentials: SignUpCredentials) =>
      authService.signUp(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      notifications.show({
        title: "Welcome!",
        message: "Your account has been created successfully.",
        color: "green",
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      notifications.show({
        title: "Sign up failed",
        message: getErrorMessage(error),
        color: "red",
      });
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken);
      notifications.show({
        title: "Welcome back!",
        message: `Good to see you, ${data.user.name}!`,
        color: "green",
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      notifications.show({
        title: "Login failed",
        message: getErrorMessage(error),
        color: "red",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push("/auth/login");
      notifications.show({
        title: "Logged out",
        message: "You have been logged out successfully.",
        color: "blue",
      });
    },
  });

  return {
    user: userQuery.data || user,
    isAuthenticated,
    isLoading: isLoading || userQuery.isLoading,

    // Mutations
    signUp: signUpMutation.mutate,
    isSigningUp: signUpMutation.isPending,

    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
