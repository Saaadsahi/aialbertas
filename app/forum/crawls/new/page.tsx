import Link from "next/link";
import { redirect } from "next/navigation";
import { Nav } from "@/components/nav";
import { CinematicCrawlForm } from "@/components/cinematic-crawl-form";
import { MotionReveal } from "@/components/motion-reveal";
import { getSessionUser } from "@/lib/auth/admin";

export default async function NewCrawlPage() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    redirect("/login?redirect=/forum/crawls/new");
  }

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <MotionReveal className="flex items-center gap-3 text-sm">
          <Link href="/forum" className="text-muted hover:text-black">← Back to forum</Link>
        </MotionReveal>
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <MotionReveal delayMs={80}>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Transmission builder</p>
            <h1 className="mt-4 font-display text-4xl tracking-tight text-black sm:text-6xl">
              Launch a new cinematic crawl.
            </h1>
            <p className="mt-5 max-w-xl text-sm text-muted sm:text-base">
              Build a saved Star Wars style forum opening crawl with draft visibility, replay controls,
              and forum reactions around it. Published transmissions are public. Drafts stay visible only
              to you and admins.
            </p>
          </MotionReveal>
          <MotionReveal delayMs={140}>
            <CinematicCrawlForm mode="create" sessionUser={sessionUser} />
          </MotionReveal>
        </div>
      </div>
    </main>
  );
}
