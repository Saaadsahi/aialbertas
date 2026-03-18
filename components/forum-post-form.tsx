"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { containsForumLink, formatForumName } from "@/lib/forum";
import type { SessionForumUser } from "@/lib/types/cinematic-crawl";

type ForumPostFormProps = {
  sessionUser: SessionForumUser | null;
};

export function ForumPostForm({ sessionUser }: ForumPostFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSubject = subject.trim();
    const normalizedBody = body.trim();

    if (!normalizedSubject || !normalizedBody) {
      setSubmitState("error");
      setSubmitMessage("Please add both a subject and a body.");
      return;
    }

    if (containsForumLink(normalizedSubject) || containsForumLink(normalizedBody)) {
      setSubmitState("error");
      setSubmitMessage("Links are not allowed in forum posts. Send us an email instead.");
      return;
    }

    if (!sessionUser) {
      router.push("/login?redirect=/forum");
      return;
    }

    setSubmitState("saving");
    setSubmitMessage(null);

    const { error } = await supabase.from("forum_posts").insert({
      user_id: sessionUser.id,
      full_name: formatForumName(sessionUser.full_name ?? sessionUser.email?.split("@")[0] ?? null),
      subject: normalizedSubject,
      body: normalizedBody
    });

    if (error) {
      setSubmitState("error");
      setSubmitMessage("Could not save your post right now.");
      return;
    }

    setSubject("");
    setBody("");
    setSubmitState("idle");
    router.refresh();
  }

  if (!sessionUser) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      {submitState === "error" && submitMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {submitMessage}
        </p>
      )}
      <div>
        <label className="text-xs text-muted">Subject</label>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
          maxLength={120}
          className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
          placeholder="What are you trying to build?"
        />
      </div>
      <div>
        <label className="text-xs text-muted">Body</label>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          required
          maxLength={1200}
          className="mt-1 h-36 w-full rounded-2xl border border-black/15 bg-white px-3 py-2 text-sm leading-7 outline-none focus:border-black/40"
          placeholder="Write the details here."
        />
      </div>
      <button
        type="submit"
        disabled={submitState === "saving"}
        className="rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {submitState === "saving" ? "Posting..." : "Post to forum"}
      </button>
    </form>
  );
}
