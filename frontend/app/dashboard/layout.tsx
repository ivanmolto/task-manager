"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores";
import { useAuth } from "@/hooks";
import {
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  // Removed unused 'User' import to fix the warning
} from "lucide-react";
import { Button, Avatar, Text, Loader } from "@mantine/core";

const emptySubscribe = () => () => {};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, setLoading } = useAuthStore();
  const { logout, isLoggingOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Effect 1: Sync auth loading with the client-ready state
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // Effect 2: Handle Route Guarding (The "Bouncer")
  // Only redirects if we are mounted and definitely not authenticated
  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Prevent "Hydration Mismatch" by showing a loader until the client is ready
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size="lg" color="indigo" />
          <Text c="dimmed" mt="md">
            Loading...
          </Text>
        </div>
      </div>
    );
  }

  // Final check to prevent content flash for unauthenticated users
  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
            <Link href="/dashboard" className="flex items-center gap-2">
              <CheckSquare className="h-7 w-7 text-indigo-600" />
              <span className="text-lg font-bold text-slate-800">
                TaskManager
              </span>
            </Link>
            <button
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-slate-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <Avatar color="indigo" radius="xl" size="sm">
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <div className="flex-1 min-w-0">
                <Text size="sm" fw={500} truncate>
                  {user?.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {user?.email}
                </Text>
              </div>
            </div>
            <Button
              variant="subtle"
              color="red"
              fullWidth
              leftSection={<LogOut className="h-4 w-4" />}
              onClick={() => logout()}
              loading={isLoggingOut}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <button
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <Avatar color="indigo" radius="xl" size="sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Text size="sm" fw={500}>
                  {user?.name}
                </Text>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
