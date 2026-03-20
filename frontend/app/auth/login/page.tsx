"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Text,
  Anchor,
} from "@mantine/core";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
        <p className="text-slate-600 mt-2">
          Sign in to continue to your dashboard
        </p>
      </div>

      <Paper shadow="sm" p="xl" radius="lg" className="bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextInput
            label="Email"
            placeholder="you@example.com"
            leftSection={<Mail className="h-4 w-4 text-slate-400" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            leftSection={<Lock className="h-4 w-4 text-slate-400" />}
            error={errors.password?.message}
            {...register("password")}
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoggingIn}
            className="mt-6"
          >
            Sign in
          </Button>
        </form>
      </Paper>

      <Text ta="center" mt="xl" c="dimmed" size="sm">
        Don&apos;t have an account?{" "}
        <Anchor component={Link} href="/auth/signup" fw={500}>
          Create one
        </Anchor>
      </Text>
    </div>
  );
}
