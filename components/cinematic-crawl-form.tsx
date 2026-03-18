"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { containsForumLink, formatForumName } from "@/lib/forum";
import type { CinematicCrawlRecord, ForumPostStatus, SessionForumUser } from "@/lib/types/cinematic-crawl";
import { CinematicCrawlPlayer } from "@/components/cinematic-crawl-player";

type CinematicCrawlFormProps = {
  mode: "create" | "edit";
  sessionUser: SessionForumUser;
  initialCrawl?: CinematicCrawlRecord;
};

const defaultTransmissionBody = `The Guy Who Fixed Things

Saad never planned to become the guy who fixes things. It just sort of happened.

One day someone couldn't log into their website. Another day someone's email wasn't working. Then someone's database broke at midnight. For some reason, Saad was always the person people called. Not because he had all the answers, but because he was curious enough to figure them out.

He grew up the kind of person who pressed every button just to see what would happen. Computers, websites, servers, code, AI tools - if something existed, Saad wanted to open it up and see how it worked. Sometimes things broke. Actually... a lot of things broke. But every broken thing became a puzzle.

Soon he realized something interesting: most people weren't bad with technology. They were just stuck.

A business owner couldn't connect their software. A startup founder couldn't automate their workflow. A website worked perfectly on a developer's laptop but completely died when it went live.

To Saad, these weren't disasters. They were mysteries.

He started building things. Small tools first. Then bigger ones. AI systems. Websites. Automation scripts. Databases that tracked everything from payments to users. Sometimes he would sit for hours staring at an error message that made absolutely no sense.

But when the system finally worked - when the site went live, when the automation ran perfectly, when someone messaged him saying "it works now!" - that was the moment he loved.

Because behind every broken system was a person just trying to make something work.

And somehow Saad always ended up being the guy who figured it out.

Not because he was the smartest person in the room.

But because he never stopped asking one simple question:

"Okay... but why is it broken?"

And once you ask that question long enough... eventually you find the answer.`;

export function CinematicCrawlForm({
  mode,
  sessionUser,
  initialCrawl
}: CinematicCrawlFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const [subject, setSubject] = useState(initialCrawl?.subject ?? "Episode 1");
  const [crawlTitle, setCrawlTitle] = useState(initialCrawl?.crawl_title ?? "Ai Alberta Transmission");
  const [body, setBody] = useState(
    initialCrawl?.body ?? defaultTransmissionBody
  );
  const [status, setStatus] = useState<ForumPostStatus>(initialCrawl?.status ?? "published");
  const [duration, setDuration] = useState(initialCrawl?.crawl_duration ?? 60);
  const [tilt, setTilt] = useState(Number(initialCrawl?.crawl_tilt ?? 22));
  const [fontSize, setFontSize] = useState(initialCrawl?.crawl_font_size ?? 28);
  const [showStars, setShowStars] = useState(initialCrawl?.crawl_show_stars ?? true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSubject = subject.trim();
    const normalizedTitle = crawlTitle.trim();
    const normalizedBody = body.trim();

    if (!normalizedSubject || !normalizedTitle || !normalizedBody) {
      setSubmitState("error");
      setSubmitMessage("Add an episode label, transmission title, and crawl text.");
      return;
    }

    if (containsForumLink(normalizedSubject) || containsForumLink(normalizedTitle) || containsForumLink(normalizedBody)) {
      setSubmitState("error");
      setSubmitMessage("Links are not allowed in cinematic crawls. Send us an email instead.");
      return;
    }

    if (sessionUser.is_banned) {
      setSubmitState("error");
      setSubmitMessage("Your account is currently banned from posting.");
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
      setSubmitMessage("Could not prepare your profile for posting.");
      return;
    }

    const payload = {
      user_id: sessionUser.id,
      full_name: profileName,
      post_type: "cinematic_crawl" as const,
      status,
      subject: normalizedSubject,
      body: normalizedBody,
      crawl_title: normalizedTitle,
      crawl_duration: duration,
      crawl_tilt: tilt,
      crawl_font_size: fontSize,
      crawl_show_stars: showStars,
      featured: false
    };

    const query = initialCrawl
      ? supabase.from("forum_posts").update(payload).eq("id", initialCrawl.id).select("id").single()
      : supabase.from("forum_posts").insert(payload).select("id").single();

    const { data, error } = await query;

    if (error || !data) {
      setSubmitState("error");
      setSubmitMessage("Could not save this transmission right now.");
      return;
    }

    router.push(`/forum/crawls/${data.id}`);
    router.refresh();
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-5 rounded-[32px] border border-black/10 bg-[#f8f6f1] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">Ai Alberta Transmission</p>
            <h1 className="mt-2 font-display text-3xl tracking-tight text-black">
              {mode === "create" ? "Create cinematic crawl" : "Edit cinematic crawl"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="rounded-full border border-black/20 bg-white px-5 py-2 text-sm text-black hover:bg-black hover:text-white"
          >
            Live preview
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs text-muted">Episode label</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={120}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
              placeholder="Episode 1"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Transmission title</label>
            <input
              value={crawlTitle}
              onChange={(event) => setCrawlTitle(event.target.value)}
              maxLength={160}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
              placeholder="Ai Alberta Transmission"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted">Transmission text</label>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={2600}
            className="mt-1 h-64 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-black/40"
            placeholder="Write the crawl text here. Paragraph breaks are preserved."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs text-muted">Visibility</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ForumPostStatus)}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">Duration</label>
            <input
              type="number"
              min={12}
              max={120}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Tilt</label>
            <input
              type="number"
              min={10}
              max={40}
              value={tilt}
              onChange={(event) => setTilt(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Font size</label>
            <input
              type="number"
              min={18}
              max={56}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-5 rounded-2xl border border-black/10 bg-white px-4 py-4">
          <label className="flex items-center gap-3 text-sm text-black">
            <input
              type="checkbox"
              checked={showStars}
              onChange={(event) => setShowStars(event.target.checked)}
            />
            Star field
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={submitState === "saving"}
            className="rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {submitState === "saving" ? "Saving..." : mode === "create" ? "Save transmission" : "Update transmission"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-black/20 px-6 py-2 text-sm text-black hover:bg-black hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-0 top-[-2.75rem] rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white hover:border-[#f4d05a] hover:text-[#f4d05a]"
            >
              Close
            </button>
            <CinematicCrawlPlayer
              title={crawlTitle || "Ai Alberta Transmission"}
              episode={subject || "Episode 1"}
              body={body || "Preview your cinematic crawl here."}
              duration={duration}
              tilt={tilt}
              fontSize={fontSize}
              showStars={showStars}
              className="max-h-[85vh]"
            />
          </div>
        </div>
      )}
    </>
  );
}
