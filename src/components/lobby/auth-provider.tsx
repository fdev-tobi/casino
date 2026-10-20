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
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (username: string) => void;
  logout: () => void;
  openLogin: () => void;
  loginOpen: boolean;
  setLoginOpen: (open: boolean) => void;
};

const STORAGE_KEY = "adopt-luck-user";

const AuthContext = createContext<AuthContextValue | null>(null);

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
          setUser(parsed);
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const login = useCallback((username: string) => {
    const next = { username: username.trim() };
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
