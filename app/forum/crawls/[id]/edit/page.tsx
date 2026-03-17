import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { CinematicCrawlForm } from "@/components/cinematic-crawl-form";
import { MotionReveal } from "@/components/motion-reveal";
import { getSessionUser } from "@/lib/auth/admin";
import { createOptionalServerSupabaseClient } from "@/lib/supabase/server";
import type { CinematicCrawlRecord } from "@/lib/types/cinematic-crawl";

export default async function EditCrawlPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, sessionUser, supabase] = await Promise.all([
    params,
    getSessionUser(),
    createOptionalServerSupabaseClient()
  ]);

  if (!sessionUser) {
    redirect(`/login?redirect=${encodeURIComponent(`/forum/crawls/${id}/edit`)}`);
  }

  if (!supabase) {
    notFound();
  }

  const { data: crawl } = await supabase
    .from("forum_posts")
    .select("*")
    .eq("id", id)
    .eq("post_type", "cinematic_crawl")
    .maybeSingle();

  if (!crawl) {
    notFound();
  }

  const canManage = sessionUser.role === "admin" || crawl.user_id === sessionUser.id;
  if (!canManage) {
    redirect(`/forum/crawls/${id}`);
  }

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <MotionReveal className="flex items-center gap-3 text-sm">
          <Link href={`/forum/crawls/${id}`} className="text-muted hover:text-black">← Back to transmission</Link>
        </MotionReveal>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <MotionReveal delayMs={80}>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Edit transmission</p>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-black sm:text-6xl">
              Refine the crawl and replay it.
            </h1>
            <p className="mt-5 max-w-xl text-sm text-muted sm:text-base">
              Adjust pacing, tilt, scale, stars, and visibility. The saved record stays tied to its comments and reactions.
            </p>
          </MotionReveal>
          <MotionReveal delayMs={140}>
            <CinematicCrawlForm
              mode="edit"
              sessionUser={sessionUser}
              initialCrawl={crawl as CinematicCrawlRecord}
            />
          </MotionReveal>
        </div>
      </div>
    </main>
  );
}
