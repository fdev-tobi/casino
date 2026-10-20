"use client";

import { useEffect, useState } from "react";

import { useRobloxAvatars } from "@/components/lobby/roblox-avatar-provider";
import { cn } from "@/lib/utils";
import type { DemoPlayer } from "@/types/lobby";

type AvatarPlayer = Pick<DemoPlayer, "initials" | "color" | "name"> & {
  robloxUserId?: number | null;
  avatarUrl?: string | null;
};

export function Avatar({
  player,
  size = "md",
  className,
}: {
  player: AvatarPlayer;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { getAvatarUrl, ensureAvatars } = useRobloxAvatars();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    ensureAvatars({
      usernames: [player.name],
      userIds: player.robloxUserId ? [player.robloxUserId] : [],
    });
  }, [ensureAvatars, player.name, player.robloxUserId]);

  const imageUrl = imageFailed
    ? null
    : player.avatarUrl ||
      getAvatarUrl({ username: player.name, userId: player.robloxUserId });

  const sizeClass =
    size === "sm" ? "size-8 text-[0.65rem]" : size === "lg" ? "size-14 text-base" : "size-10 text-xs";

  return (
    <span
      title={player.name}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 font-bold text-white",
        sizeClass,
        className,
      )}
      style={imageUrl ? undefined : { background: player.color }}
    >
      {imageUrl ? (
        // Roblox CDN headshots — plain img avoids Next image config churn on rotating CDN hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        player.initials
      )}
    </span>
  );
}
