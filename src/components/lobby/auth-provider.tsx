"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthUser = {
  username: string;
  displayName?: string;
  userId?: number;
  avatarUrl?: string | null;
};

type LoginPayload = {
  username: string;
  displayName?: string;
  userId?: number;
  avatarUrl?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (payload: LoginPayload | string) => void;
  logout: () => void;
  openLogin: () => void;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
};

const STORAGE_KEY = "adopt-luck-user";

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUser(payload: LoginPayload | string): AuthUser {
  if (typeof payload === "string") {
    return { username: payload.trim() };
  }
  return {
    username: payload.username.trim(),
    displayName: payload.displayName?.trim() || undefined,
    userId: typeof payload.userId === "number" ? payload.userId : undefined,
    avatarUrl: payload.avatarUrl ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        if (parsed?.username) {
          setUser(normalizeUser(parsed));
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const login = useCallback((payload: LoginPayload | string) => {
    const next = normalizeUser(payload);
    setUser(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const openLogin = useCallback(() => setLoginOpen(true), []);

  const value = useMemo(
    () => ({
      user: hydrated ? user : null,
      login,
      logout,
      openLogin,
      loginOpen,
      setLoginOpen,
    }),
    [hydrated, user, login, logout, openLogin, loginOpen],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
