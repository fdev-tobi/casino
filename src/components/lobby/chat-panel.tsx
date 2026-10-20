"use client";

import { Smile } from "lucide-react";
import { useMemo, useState } from "react";

import { useAuth } from "@/components/lobby/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatMessages as seedMessages } from "@/lib/mock-data";
import type { ChatMessage } from "@/types/lobby";

function nowLabel() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ChatPanel({
  className,
  onRequireLogin,
}: {
  className?: string;
  onRequireLogin?: () => void;
}) {
  const { user, openLogin } = useAuth();
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [...seedMessages]);

  const count = useMemo(() => messages.length, [messages]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between rounded border bg-card/60 px-6 py-3">
        <div className="text-sm font-semibold opacity-50">Messages</div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold opacity-50">{count}</div>
          <div className="animate-pulse rounded-full border-2 border-destructive/50">
            <div className="h-2 w-2 rounded-full bg-destructive" />
          </div>
        </div>
      </div>

      <div className="mb-2 flex h-full flex-col gap-6 overflow-y-scroll py-2 pr-2">
        {messages.map((message) => (
          <div key={message.id} className="text-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-primary">{message.user}</span>
              <span className="text-xs text-white/40">{message.at}</span>
            </div>
            <p className="mt-0.5 text-white/80">{message.text}</p>
          </div>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const text = draft.trim();
          if (!text) return;
          if (!user) {
            (onRequireLogin ?? openLogin)();
            return;
          }
          setMessages((current) => [
            ...current,
            {
              id: `local-${Date.now()}`,
              user: user.username,
              text,
              at: nowLabel(),
            },
          ]);
          setDraft("");
        }}
      >
        <div className="relative">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={user ? "Say something..." : "Login to start chatting!"}
            aria-label="Chat message"
            className="h-12 rounded-lg border-2 border-transparent bg-input/80 pr-10 font-semibold text-gray-400 placeholder:text-white/50 focus-visible:border-white/60 focus-visible:ring-0"
          />
          <button
            type="button"
            className="absolute top-1/2 right-4 z-10 -translate-y-1/2 text-white/50 transition hover:text-white"
            aria-label="Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2 mb-6 flex gap-2">
          <Button type="submit" variant="secondary" className="h-10 flex-1 font-semibold text-white">
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
