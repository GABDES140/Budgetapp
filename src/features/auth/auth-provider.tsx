"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getLocalAuthState, loginLocalUser, logoutLocalUser, registerLocalUser } from "@/services/auth-service";
import type { AuthSession, LoginUserInput, RegisterUserInput, User } from "@/types";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  session: AuthSession | null;
  user: User | null;
  login: (input: LoginUserInput) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  register: (input: RegisterUserInput) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_ROUTES = ["/connexion", "/inscription"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    const state = await getLocalAuthState();
    setSession(state.session);
    setUser(state.user);
    setIsLoading(false);
  }

  async function login(input: LoginUserInput) {
    const result = await loginLocalUser(input);
    setSession(result.session);
    setUser(result.user);
    router.replace("/dashboard");
  }

  async function register(input: RegisterUserInput) {
    const result = await registerLocalUser(input);
    setSession(result.session);
    setUser(result.user);
    router.replace("/dashboard");
  }

  function logout() {
    logoutLocalUser();
    setSession(null);
    setUser(null);
    router.replace("/connexion");
  }

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (!session && !isAuthRoute) {
      router.replace("/connexion");
      return;
    }

    if (session && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [isLoading, pathname, router, session]);

  const value: AuthContextValue = {
    isLoading,
    isAuthenticated: Boolean(session && user),
    session,
    user,
    login,
    logout,
    refresh,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit etre utilise dans AuthProvider.");
  }

  return context;
}
