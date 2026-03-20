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
  Progress,
} from "@mantine/core";
import { Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks";
import { useState, useMemo } from "react";

const signupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must not exceed 100 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/\d/.test(password)) strength += 15;
  if (/[^a-zA-Z\d]/.test(password)) strength += 15;
  return Math.min(strength, 100);
}

function getStrengthColor(strength: number): string {
  if (strength < 30) return "red";
  if (strength < 60) return "orange";
  if (strength < 80) return "yellow";
  return "green";
}

export default function SignupPage() {
  const { signUp, isSigningUp } = useAuth();
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );

  const onSubmit = (data: SignupFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...signUpData } = data;
    signUp(signUpData);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">
          Create your account
        </h2>
        <p className="text-slate-600 mt-2">Start organizing your tasks today</p>
      </div>

      <Paper shadow="sm" p="xl" radius="lg" className="bg-white">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <TextInput
            label="Full name"
            placeholder="John Doe"
            leftSection={<User className="h-4 w-4 text-slate-400" />}
            error={errors.name?.message}
            {...register("name")}
          />

          <TextInput
            label="Email"
            placeholder="you@example.com"
            leftSection={<Mail className="h-4 w-4 text-slate-400" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <div>
            <PasswordInput
              label="Password"
              placeholder="Create a strong password"
              leftSection={<Lock className="h-4 w-4 text-slate-400" />}
              error={errors.password?.message}
              {...register("password", {
                onChange: (e) => setPassword(e.target.value),
              })}
            />
            {password && (
              <div className="mt-2">
                <Progress
                  value={passwordStrength}
                  color={getStrengthColor(passwordStrength)}
                  size="xs"
                />
                <Text size="xs" c="dimmed" mt={4}>
                  Password strength:{" "}
                  {passwordStrength < 30
                    ? "Weak"
                    : passwordStrength < 60
                      ? "Fair"
                      : passwordStrength < 80
                        ? "Good"
                        : "Strong"}
                </Text>
              </div>
            )}
          </div>

          <PasswordInput
            label="Confirm password"
            placeholder="Confirm your password"
            leftSection={<Lock className="h-4 w-4 text-slate-400" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            fullWidth
            loading={isSigningUp}
            className="mt-6"
          >
            Create account
          </Button>
        </form>
      </Paper>

      <Text ta="center" mt="xl" c="dimmed" size="sm">
        Already have an account?{" "}
        <Anchor component={Link} href="/auth/login" fw={500}>
          Sign in
        </Anchor>
      </Text>
    </div>
  );
}
