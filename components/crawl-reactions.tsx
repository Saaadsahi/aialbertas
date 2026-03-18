"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { CrawlReactionRecord, ForumReactionType, SessionForumUser } from "@/lib/types/cinematic-crawl";

type CrawlReactionsProps = {
  postId: string;
  reactions: CrawlReactionRecord[];
  sessionUser: SessionForumUser | null;
};

const reactionMeta: Array<{ type: ForumReactionType; label: string; icon: string }> = [
  { type: "boost", label: "Boost", icon: "++" },
  { type: "signal", label: "Signal", icon: "<<" },
  { type: "orbit", label: "Orbit", icon: "oo" }
];

export function CrawlReactions({
  postId,
  reactions,
  sessionUser
}: CrawlReactionsProps) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [pendingType, setPendingType] = useState<ForumReactionType | null>(null);

  const activeReaction = sessionUser
    ? reactions.find((reaction) => reaction.user_id === sessionUser.id)?.reaction_type ?? null
    : null;

  const counts = useMemo(() => {
    return reactions.reduce<Record<ForumReactionType, number>>(
      (acc, reaction) => {
        acc[reaction.reaction_type] += 1;
        return acc;
      },
      { boost: 0, signal: 0, orbit: 0 }
    );
  }, [reactions]);

  async function handleReaction(type: ForumReactionType) {
    if (!sessionUser) {
      router.push(`/login?redirect=${encodeURIComponent(`/forum/crawls/${postId}`)}`);
      return;
    }

    if (sessionUser.is_banned) {
      return;
    }

    setPendingType(type);

    await supabase.from("profiles").upsert(
      {
        id: sessionUser.id,
        email: sessionUser.email,
        full_name: sessionUser.full_name,
      },
      { onConflict: "id" }
    );

    if (activeReaction === type) {
      await supabase.from("forum_reactions").delete().eq("post_id", postId).eq("user_id", sessionUser.id);
    } else {
      await supabase.from("forum_reactions").upsert({
        post_id: postId,
        user_id: sessionUser.id,
        reaction_type: type
      });
    }

    setPendingType(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {reactionMeta.map((reaction) => {
        const isActive = activeReaction === reaction.type;
        const isPending = pendingType === reaction.type;

        return (
          <button
            key={reaction.type}
            type="button"
            onClick={() => handleReaction(reaction.type)}
            disabled={isPending}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] transition-colors ${
              isActive
                ? "border-[#f4d05a] bg-[#f4d05a]/10 text-[#f4d05a]"
                : "border-black/15 bg-white text-black hover:border-black hover:bg-black hover:text-white"
            }`}
          >
            {reaction.icon} {reaction.label} {counts[reaction.type]}
          </button>
        );
      })}
    </div>
  );
}
