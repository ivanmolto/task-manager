"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { CheckSquare } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <CheckSquare className="h-10 w-10" />
            <span className="text-2xl font-bold">TaskManager</span>
          </div>
        </div>

        <div className="text-white">
          <h1 className="text-4xl font-bold mb-4">
            Organize your work,
            <br />
            amplify your productivity.
          </h1>
          <p className="text-indigo-200 text-lg">
            A powerful task management platform designed for teams and
            individuals who want to get things done efficiently.
          </p>
        </div>

        <div className="text-indigo-200 text-sm">
          <p>Made with ❤️ from Malta</p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <CheckSquare className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-slate-800">TaskFlow</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
