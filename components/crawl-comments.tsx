"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { containsForumLink, formatForumName } from "@/lib/forum";
import type { CrawlCommentRecord, SessionForumUser } from "@/lib/types/cinematic-crawl";

type CrawlCommentsProps = {
  postId: string;
  comments: CrawlCommentRecord[];
  sessionUser: SessionForumUser | null;
  canInteract: boolean;
};

export function CrawlComments({
  postId,
  comments,
  sessionUser,
  canInteract
}: CrawlCommentsProps) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [body, setBody] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedBody = body.trim();
    if (!normalizedBody) {
      setSubmitState("error");
      setSubmitMessage("Write a comment before submitting.");
      return;
    }

    if (containsForumLink(normalizedBody)) {
      setSubmitState("error");
      setSubmitMessage("Links are not allowed in comments. Send us an email instead.");
      return;
    }

    if (!sessionUser) {
      setSubmitState("error");
      setSubmitMessage("Sign in before commenting.");
      return;
    }

    if (sessionUser.is_banned) {
      setSubmitState("error");
      setSubmitMessage("Your account is currently banned from commenting.");
      return;
    }

    setSubmitState("saving");
    setSubmitMessage(null);

    const profileName = formatForumName(sessionUser.full_name ?? sessionUser.email?.split("@")[0] ?? null);

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: sessionUser.id,
        email: sessionUser.email,
        full_name: profileName,
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setSubmitState("error");
      setSubmitMessage("Could not prepare your profile for commenting.");
      return;
    }

    const { error } = await supabase.from("forum_comments").insert({
      post_id: postId,
      user_id: sessionUser.id,
      full_name: profileName,
      body: normalizedBody
    });

    if (error) {
      setSubmitState("error");
      setSubmitMessage("Could not save your comment right now.");
      return;
    }

    setBody("");
    setSubmitState("idle");
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        <h2 className="font-display text-3xl tracking-tight text-black">Comments</h2>
        <div className="mt-5 space-y-4">
          {comments.map((comment, index) => (
            <article
              key={comment.id}
              className="rounded-[24px] border border-black/10 bg-[#fafaf8] p-4 shadow-[0_10px_24px_rgba(0,0,0,0.03)]"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-black">{comment.full_name || "Member"}</p>
                <p className="text-xs text-muted">{new Date(comment.created_at).toLocaleString()}</p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{comment.body}</p>
            </article>
          ))}
          {comments.length === 0 && (
            <div className="rounded-[24px] border border-black/10 bg-white px-5 py-8 text-center">
              <p className="text-sm text-black">No comments yet.</p>
              <p className="mt-1 text-xs text-muted">Start the discussion under this transmission.</p>
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-[28px] border border-black/10 bg-[#f8f6f1] p-5">
        <h2 className="font-display text-2xl tracking-tight text-black">Reply to transmission</h2>
        <p className="mt-2 text-sm text-muted">
          Comments stay attached to the saved crawl so the transmission can be replayed later with its discussion intact.
        </p>
        {submitState === "error" && submitMessage && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {submitMessage}
          </p>
        )}
        {sessionUser && canInteract ? (
          <form onSubmit={handleCommentSubmit} className="mt-5 space-y-4">
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={800}
              className="h-32 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
              placeholder="Add your comment"
            />
            <button
              type="submit"
              disabled={submitState === "saving"}
              className="rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitState === "saving" ? "Sending..." : "Comment"}
            </button>
          </form>
        ) : (
          <Link
            href={`/login?redirect=${encodeURIComponent(`/forum/crawls/${postId}`)}`}
            className="mt-5 inline-block rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
          >
            Sign in to comment
          </Link>
        )}
      </aside>
    </div>
  );
}
