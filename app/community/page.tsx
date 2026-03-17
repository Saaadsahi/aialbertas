import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import Link from "next/link";
import { createOptionalServerSupabaseClient } from "@/lib/supabase/server";

const socialLinks = [
  {
    label: "Email",
    href: "/contact",
    tag: "Talk to us directly",
    icon: "email" as const,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/ai.alberta?igsh=MTZybm8yYTN6dmp5YQ%3D%3D&utm_source=qr",
    tag: "@ai.alberta",
    icon: "instagram" as const,
  },
  {
    label: "Reddit",
    href: "https://www.reddit.com/r/Aialberta/s/1kyCdBWdut",
    tag: "r/Aialberta",
    icon: "reddit" as const,
  },
];

export default async function CommunityPage() {
  const supabase = await createOptionalServerSupabaseClient();

  const postsResult = supabase
    ? await supabase.from("forum_posts").select("id, full_name, subject, body").order("created_at", { ascending: false }).limit(8)
    : { data: [] as Array<{ id: string; full_name: string | null; subject: string; body: string }>, error: null };

  const posts = postsResult.data ?? [];
  const marqueePosts = posts.length > 0 ? [...posts, ...posts] : [];

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">— Join the conversation</MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl tracking-tight text-black sm:text-6xl" delayMs={80}>
          Alberta&apos;s AI is alive.
        </MotionReveal>
        <MotionReveal as="p" className="mt-4 max-w-xl text-sm text-muted" delayMs={140}>
          Connect with builders, owners, and architects across Alberta. Share wins, ask questions,
          and stay on the edge of what&apos;s possible.
        </MotionReveal>

        <MotionReveal className="mt-16 rounded-[32px] border border-black/10 bg-black p-6 text-white" delayMs={180}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-white/50">Forum</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-5xl">
                What people are saying
              </h2>
            </div>
            <Link
              href="/forum"
              className="rounded-full border border-white/20 px-5 py-2 text-sm text-white hover:bg-white hover:text-black"
            >
              Open forum
            </Link>
          </div>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
            {marqueePosts.length > 0 ? (
              <div className="forum-marquee-track">
                {marqueePosts.map((post, index) => (
                  <Link
                    key={`${post.id}-${index}`}
                    href={`/forum/${post.id}`}
                    className="forum-marquee-card block"
                  >
                    <p className="text-lg font-semibold text-white">
                      {(post.full_name || "Member")} says...
                    </p>
                    <p className="mt-3 font-display text-2xl tracking-tight text-white">
                      {post.subject}
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/70">
                      {post.body}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-white">No forum posts yet.</p>
                <p className="mt-1 text-xs text-white/60">Once somebody posts, it will loop here.</p>
              </div>
            )}
          </div>
        </MotionReveal>

        <div className="mt-16">
          <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted" delayMs={260}>Connect</MotionReveal>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {socialLinks.map((tile, index) => (
              <MotionReveal
                key={tile.label}
                className="group flex flex-col justify-between rounded-3xl border border-black/10 bg-black/5 p-8 transition-colors hover:bg-black hover:text-white"
                delayMs={320 + index * 80}
                variant="soft"
              >
                <Link
                  href={tile.href}
                  className="group block"
                >
                  <div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-black/10 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-colors group-hover:border-white/20 group-hover:bg-white/10">
                      <SocialIcon kind={tile.icon} />
                    </div>
                    <h3 className="mt-4 font-display text-2xl tracking-tight text-black group-hover:text-white">
                      {tile.label}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm text-muted group-hover:text-white/60">{tile.tag}</p>
                </Link>
              </MotionReveal>
            ))}
          </div>
        </div>

        <MotionReveal className="mt-16 rounded-[32px] border border-black/10 bg-[linear-gradient(180deg,#fafaf8_0%,#ffffff_100%)] p-8" delayMs={220} variant="soft">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Event</p>
          <h2 className="mt-4 font-display text-3xl tracking-tight text-black sm:text-5xl">
            Post
          </h2>
          <p className="mt-3 text-base text-black/80 sm:text-lg">
            Wanna host an event?
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="rounded-full border border-black/15 bg-black px-6 py-2 text-sm text-white hover:bg-gray-800"
            >
              Yes
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-black/20 px-6 py-2 text-sm text-black hover:bg-black hover:text-white"
            >
              Yes
            </Link>
          </div>
          <p className="mt-8 text-sm text-muted">
            Official tech meetups coming soon.
          </p>
        </MotionReveal>
      </div>
    </main>
  );
}

function SocialIcon({ kind }: { kind: "instagram" | "reddit" | "email" }) {
  if (kind === "instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 132 132" className="h-9 w-9">
        <defs>
          <linearGradient id="ig-b" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0" stopColor="#fd5" />
            <stop offset=".1" stopColor="#fd5" />
            <stop offset=".5" stopColor="#ff543e" />
            <stop offset="1" stopColor="#c837ab" />
          </linearGradient>
          <linearGradient id="ig-c" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0" stopColor="#3771c8" />
            <stop offset=".128" stopColor="#3771c8" />
            <stop offset="1" stopColor="#60f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fill="url(#ig-b)"
          d="M66.034 1C38.892 1 30.954 1.028 29.411 1.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C5.004 14.126 2.504 19.394 1.599 25.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C117.904 5 112.644 2.5 106.376 1.596 103.339 1.157 102.734 1.027 87.194 1H66.034z"
        />
        <path
          fill="url(#ig-c)"
          d="M66.034 1C38.892 1 30.954 1.028 29.411 1.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C5.004 14.126 2.504 19.394 1.599 25.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C117.904 5 112.644 2.5 106.376 1.596 103.339 1.157 102.734 1.027 87.194 1H66.034z"
        />
        <path
          fill="#fff"
          d="M67.008 19c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65C19.064 52.327 19.004 53.964 19.004 67s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788 0-13.036-.06-14.672-.29-19.792-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59-1.68-1.68-2.72-3.276-3.592-5.517-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52 1.68-1.68 3.28-2.72 5.52-3.592 1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27z"
        />
        <path
          fill="#fff"
          d="M67.008 42.35c-13.613 0-24.65 11.037-24.65 24.65 0 13.613 11.037 24.645 24.65 24.645 13.613 0 24.646-11.032 24.646-24.645 0-13.613-11.034-24.65-24.646-24.65zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16zm25.622-15.38c-3.18 0-5.76 2.577-5.76 5.758 0 3.18 2.58 5.76 5.76 5.76 3.18 0 5.76-2.58 5.76-5.76 0-3.18-2.58-5.76-5.76-5.76z"
        />
      </svg>
    );
  }

  if (kind === "reddit") {
    return (
      <svg aria-hidden="true" viewBox="0 0 90 90" className="h-9 w-9">
        <circle cx="45" cy="45" r="45" fill="#FF4500" />
        <path
          fill="#fff"
          d="M75.011 45c-.134-3.624-3.177-6.454-6.812-6.331-1.611.056-3.143.716-4.306 1.823-5.123-3.49-11.141-5.403-17.327-5.537l2.919-14.038 9.631 2.025c.268 2.472 2.483 4.262 4.955 3.993 2.472-.268 4.262-2.483 3.993-4.955s-2.483-4.262-4.955-3.993c-1.421.145-2.696.973-3.4 2.204L48.68 17.987c-.749-.168-1.499.302-1.667 1.063 0 .011 0 .011 0 .022l-3.322 15.615c-6.264.101-12.36 2.025-17.55 5.537-2.64-2.483-6.801-2.36-9.284.291-2.483 2.64-2.36 6.801.291 9.284.515.481 1.107.895 1.767 1.186-.045.66-.045 1.32 0 1.98 0 10.078 11.745 18.277 26.23 18.277 14.485 0 26.23-8.188 26.23-18.277.045-.66.045-1.32 0-1.98C73.635 49.855 75.056 47.528 75.011 45zM30.011 49.508c0-2.483 2.025-4.508 4.508-4.508 2.483 0 4.508 2.025 4.508 4.508s-2.025 4.508-4.508 4.508c-2.494-.023-4.508-2.025-4.508-4.508zm26.141 12.55v-.179c-3.199 2.405-7.114 3.635-11.119 3.468-4.005.168-7.919-1.063-11.119-3.468-.425-.515-.347-1.286.168-1.711.447-.369 1.085-.369 1.544 0 2.707 1.98 6.007 2.987 9.362 2.83 3.356.179 6.667-.783 9.407-2.74.492-.481 1.297-.47 1.779.022.481.492.47 1.297-.022 1.779zm-.615-7.718c-.078 0-.145 0-.224 0l.034-.168c-2.483 0-4.508-2.025-4.508-4.508s2.025-4.508 4.508-4.508 4.508 2.025 4.508 4.508c.101 2.483-1.834 4.575-4.317 4.676z"
        />
      </svg>
    );
  }

  return (
    <div className="relative h-9 w-9 text-black transition-colors group-hover:text-white">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute inset-0 h-9 w-9 transition-opacity duration-200 group-hover:opacity-0">
        <path
          fill="currentColor"
          d="M3 5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25v13.5A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75V5.25Zm2.279-.75 6.721 5.602 6.721-5.602H5.279ZM19.5 6.45l-7.02 5.852a.75.75 0 0 1-.96 0L4.5 6.45v12.3c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75V6.45Z"
        />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="absolute inset-0 h-9 w-9 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <path
          fill="currentColor"
          d="M3.75 5.25A2.25 2.25 0 0 1 6 3h12a2.25 2.25 0 0 1 2.25 2.25v1.19l-7.28 5.46a1.75 1.75 0 0 1-2.1 0L3.75 6.44V5.25Zm0 3.07V18A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V8.32l-6.38 4.79a3.25 3.25 0 0 1-3.74 0L3.75 8.32Z"
        />
        <path
          fill="currentColor"
          d="M2.72 6.97a.75.75 0 0 1 1.05-.13l6.9 5.18a2.25 2.25 0 0 0 2.66 0l6.9-5.18a.75.75 0 1 1 .9 1.2l-6.9 5.17a3.75 3.75 0 0 1-4.46 0L2.85 8.02a.75.75 0 0 1-.13-1.05Z"
        />
      </svg>
    </div>
  );
}
