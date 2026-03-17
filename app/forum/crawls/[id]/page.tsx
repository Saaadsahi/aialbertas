import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { CinematicCrawlPlayer } from "@/components/cinematic-crawl-player";
import { CrawlComments } from "@/components/crawl-comments";
import { CrawlReactions } from "@/components/crawl-reactions";
import { MotionReveal } from "@/components/motion-reveal";
import { createOptionalServerSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/admin";
import type {
  CinematicCrawlRecord,
  CrawlCommentRecord,
  CrawlReactionRecord
} from "@/lib/types/cinematic-crawl";

async function deleteCrawl(formData: FormData) {
  "use server";

  const postId = String(formData.get("post_id") ?? "");
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !postId) {
    redirect("/forum");
  }

  const [{ data: profile }, { data: post }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("forum_posts").select("id, user_id").eq("id", postId).maybeSingle()
  ]);

  if (!post) {
    redirect("/forum");
  }

  const isAdmin = profile?.role === "admin";
  const isAuthor = post.user_id === user.id;

  if (!isAdmin && !isAuthor) {
    redirect(`/forum/crawls/${postId}`);
  }

  await supabase.from("forum_posts").delete().eq("id", postId);
  redirect("/forum");
}

export default async function CrawlDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, sessionUser, supabase] = await Promise.all([
    params,
    getSessionUser(),
    createOptionalServerSupabaseClient()
  ]);

  if (!supabase) {
    notFound();
  }

  const [{ data: crawl }, { data: comments }, { data: reactions }] = await Promise.all([
    supabase.from("forum_posts").select("*").eq("id", id).eq("post_type", "cinematic_crawl").maybeSingle(),
    supabase.from("forum_comments").select("*").eq("post_id", id).order("created_at", { ascending: true }),
    supabase.from("forum_reactions").select("*").eq("post_id", id)
  ]);

  if (!crawl) {
    notFound();
  }

  const canManage = !!sessionUser && (sessionUser.role === "admin" || sessionUser.id === crawl.user_id);
  const isDraft = crawl.status === "draft";

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <MotionReveal className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/forum" className="text-muted hover:text-black">← Back to forum</Link>
          <span className="text-muted">/</span>
          <span className="text-black">Ai Alberta Transmission</span>
        </MotionReveal>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <MotionReveal delayMs={80}>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Ai Alberta Transmission</p>
            <h1 className="mt-3 font-display text-4xl tracking-tight text-black sm:text-6xl">
              {crawl.crawl_title || "Ai Alberta Transmission"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted sm:text-base">
              {crawl.subject} by {crawl.full_name || "Member"} • {new Date(crawl.created_at).toLocaleString()}
              {isDraft ? " • Draft visibility" : " • Public transmission"}
            </p>
          </MotionReveal>
          {canManage && (
            <MotionReveal className="flex flex-wrap gap-3" delayMs={120}>
              <Link
                href={`/forum/crawls/${crawl.id}/edit`}
                className="rounded-full border border-black/20 px-5 py-2 text-sm text-black hover:bg-black hover:text-white"
              >
                Edit transmission
              </Link>
              <form action={deleteCrawl}>
                <input type="hidden" name="post_id" value={crawl.id} />
                <button
                  type="submit"
                  className="rounded-full border border-red-200 px-5 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  Delete
                </button>
              </form>
            </MotionReveal>
          )}
        </div>

        <MotionReveal className="mt-8" delayMs={140}>
          <CinematicCrawlPlayer
            title={crawl.crawl_title || "Ai Alberta Transmission"}
            episode={crawl.subject}
            body={crawl.body}
            duration={crawl.crawl_duration}
            tilt={Number(crawl.crawl_tilt)}
            fontSize={crawl.crawl_font_size}
            showStars={crawl.crawl_show_stars}
          />
        </MotionReveal>

        <MotionReveal className="mt-8 rounded-[28px] border border-black/10 bg-[#faf8f3] p-5" delayMs={180}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">Reaction deck</p>
              <p className="mt-2 text-sm text-muted">
                Replay, pause, react, and keep the conversation attached to the saved transmission.
              </p>
            </div>
            <CrawlReactions
              postId={crawl.id}
              reactions={(reactions ?? []) as CrawlReactionRecord[]}
              sessionUser={sessionUser}
            />
          </div>
        </MotionReveal>

        <MotionReveal className="mt-8" delayMs={220}>
          <CrawlComments
            postId={crawl.id}
            comments={(comments ?? []) as CrawlCommentRecord[]}
            sessionUser={sessionUser}
            canInteract={!isDraft || canManage}
          />
        </MotionReveal>
      </div>
    </main>
  );
}
