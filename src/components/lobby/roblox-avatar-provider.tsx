"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type AvatarMaps = {
  byUsername: Record<string, string>;
  byUserId: Record<string, string>;
};

type RobloxAvatarContextValue = {
  getAvatarUrl: (input: { username?: string; userId?: number | null }) => string | null;
  ensureAvatars: (input: { usernames?: string[]; userIds?: number[] }) => void;
};

const RobloxAvatarContext = createContext<RobloxAvatarContextValue | null>(null);

export function RobloxAvatarProvider({ children }: { children: ReactNode }) {
  const [maps, setMaps] = useState<AvatarMaps>({ byUsername: {}, byUserId: {} });
  const pendingUsernames = useRef(new Set<string>());
  const pendingUserIds = useRef(new Set<number>());
  const resolvedUsernames = useRef(new Set<string>());
  const resolvedUserIds = useRef(new Set<number>());
  const failedUsernames = useRef(new Set<string>());
  const failedUserIds = useRef(new Set<number>());
  const timer = useRef<number | null>(null);
  const inFlight = useRef(false);

  const flush = useCallback(async () => {
    if (inFlight.current) return;
    const usernames = [...pendingUsernames.current];
    const userIds = [...pendingUserIds.current];
    if (usernames.length === 0 && userIds.length === 0) return;

    pendingUsernames.current.clear();
    pendingUserIds.current.clear();
    inFlight.current = true;

    try {
      const response = await fetch("/api/roblox/avatars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames, userIds }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        byUsername?: Record<string, string>;
        byUserId?: Record<string, string>;
      };

      const nextByUsername = json.byUsername ?? {};
      const nextByUserId = json.byUserId ?? {};

      for (const username of usernames) {
        const key = username.toLowerCase();
        resolvedUsernames.current.add(key);
        if (!nextByUsername[key]) {
          failedUsernames.current.add(key);
        }
      }
      for (const userId of userIds) {
        resolvedUserIds.current.add(userId);
        if (!nextByUserId[String(userId)]) {
          failedUserIds.current.add(userId);
        }
      }

      if (Object.keys(nextByUsername).length > 0 || Object.keys(nextByUserId).length > 0) {
        setMaps((prev) => ({
          byUsername: { ...prev.byUsername, ...nextByUsername },
          byUserId: { ...prev.byUserId, ...nextByUserId },
        }));
      }
    } catch {
      for (const username of usernames) {
        failedUsernames.current.add(username.toLowerCase());
        resolvedUsernames.current.add(username.toLowerCase());
      }
      for (const userId of userIds) {
        failedUserIds.current.add(userId);
        resolvedUserIds.current.add(userId);
      }
    } finally {
      inFlight.current = false;
      if (pendingUsernames.current.size > 0 || pendingUserIds.current.size > 0) {
        void flush();
      }
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
      timer.current = null;
      void flush();
    }, 40);
  }, [flush]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  const ensureAvatars = useCallback(
    (input: { usernames?: string[]; userIds?: number[] }) => {
      let queued = false;
      for (const username of input.usernames ?? []) {
        const key = username.trim().toLowerCase();
        if (!key) continue;
        if (
          resolvedUsernames.current.has(key) ||
          failedUsernames.current.has(key) ||
          pendingUsernames.current.has(key)
        ) {
          continue;
        }
        pendingUsernames.current.add(key);
        queued = true;
      }
      for (const userId of input.userIds ?? []) {
        if (!Number.isFinite(userId) || userId <= 0) continue;
        if (
          resolvedUserIds.current.has(userId) ||
          failedUserIds.current.has(userId) ||
          pendingUserIds.current.has(userId)
        ) {
          continue;
        }
        pendingUserIds.current.add(userId);
        queued = true;
      }
      if (queued) {
        scheduleFlush();
      }
    },
    [scheduleFlush],
  );

  const getAvatarUrl = useCallback(
    (input: { username?: string; userId?: number | null }) => {
      if (input.userId && maps.byUserId[String(input.userId)]) {
        return maps.byUserId[String(input.userId)];
      }
      if (input.username) {
        const key = input.username.toLowerCase();
        if (maps.byUsername[key]) {
          return maps.byUsername[key];
        }
      }
      return null;
    },
    [maps],
  );

  const value = useMemo(
    () => ({
      getAvatarUrl,
      ensureAvatars,
    }),
    [getAvatarUrl, ensureAvatars],
  );

  return <RobloxAvatarContext.Provider value={value}>{children}</RobloxAvatarContext.Provider>;
}

export function useRobloxAvatars() {
  const ctx = useContext(RobloxAvatarContext);
  if (!ctx) {
    throw new Error("useRobloxAvatars must be used within RobloxAvatarProvider");
  }
  return ctx;
}
