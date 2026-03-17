import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createOptionalServerSupabaseClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/admin";

const forumLanes = [
  {
    title: "Ask for help",
    description: "Bring stuck builds, broken automations, and implementation questions from real Alberta teams.",
    meta: "Best for operators and founders"
  },
  {
    title: "Share wins",
    description: "Post small AI wins, lessons learned, and workflows that actually moved costs or response times.",
    meta: "Best for case studies and demos"
  },
  {
    title: "Find builders",
    description: "Connect with architects, developers, and collaborators working on serious AI delivery across the province.",
    meta: "Best for partnerships and hiring"
  }
];

async function createForumPost(formData: FormData) {
  "use server";

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject || !body) {
    redirect("/forum?error=missing");
  }

  if (containsLink(subject) || containsLink(body)) {
    redirect("/forum?error=links");
  }

  const supabase = await createOptionalServerSupabaseClient();
  if (!supabase) {
    redirect("/forum?error=config");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/forum")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await supabase.from("forum_posts").insert({
    user_id: user.id,
    full_name: profile?.full_name ?? user.user_metadata?.full_name ?? "Member",
    subject,
    body,
  });

  if (error) {
    redirect("/forum?error=submit");
  }

  redirect("/forum?posted=1");
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ posted?: string; error?: string }>;
}) {
  const [sessionUser, params, supabase] = await Promise.all([
    getSessionUser(),
    searchParams,
    createOptionalServerSupabaseClient(),
  ]);

  const [postsResult, commentsResult] = supabase
    ? await Promise.all([
        supabase.from("forum_posts").select("*").order("created_at", { ascending: false }),
        supabase.from("forum_comments").select("id, post_id"),
      ])
    : [{ data: [], error: null }, { data: [], error: null }];

  const posts = postsResult.data ?? [];
  const comments = commentsResult.data ?? [];
  const commentCounts = comments.reduce<Record<string, number>>((acc, comment) => {
    acc[comment.post_id] = (acc[comment.post_id] ?? 0) + 1;
    return acc;
  }, {});

  const errorMessage =
    params.error === "missing"
      ? "Please add both a subject and a body."
      : params.error === "links"
        ? "Links are not allowed in forum posts. Send us an email instead."
        : params.error === "submit"
          ? "We could not save your post right now."
          : params.error === "config"
            ? "Forum storage is not configured yet."
            : undefined;

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">— Community forum</MotionReveal>
        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <MotionReveal delayMs={80}>
            <h1 className="font-display text-4xl tracking-tight text-black sm:text-6xl">
              A cleaner place to ask, build, and compare notes.
            </h1>
            <p className="mt-5 max-w-xl text-sm text-muted sm:text-base">
              The forum is where AiAlberta turns isolated questions into shared momentum. Bring a problem,
              document a win, or meet the people building practical AI in Alberta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              {sessionUser ? (
                <a
                  href="#new-post"
                  className="rounded-full bg-black px-6 py-2 text-white hover:bg-gray-800"
                >
                  Start a post
                </a>
              ) : (
                <Link
                  href="/login?redirect=/forum"
                  className="rounded-full bg-black px-6 py-2 text-white hover:bg-gray-800"
                >
                  Sign in to post
                </Link>
              )}
              <Link
                href="/community"
                className="rounded-full border border-black/20 px-6 py-2 text-black hover:bg-black hover:text-white"
              >
                Back to community
              </Link>
            </div>
          </MotionReveal>
          <MotionReveal className="rounded-[32px] border border-black/10 bg-gradient-to-br from-black/[0.04] via-white to-black/[0.03] p-6" delayMs={160} variant="soft">
            <div className="grid gap-4">
              {forumLanes.map((lane, index) => (
                <MotionReveal
                  key={lane.title}
                  className="rounded-3xl border border-black/10 bg-white/80 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
                  delayMs={220 + index * 90}
                  variant="soft"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="font-display text-2xl tracking-tight text-black">{lane.title}</h2>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{lane.description}</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-black/70">
                    {lane.meta}
                  </p>
                </MotionReveal>
              ))}
            </div>
          </MotionReveal>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <MotionReveal as="section" id="new-post" className="rounded-[32px] border border-black/10 bg-[#f8f6f1] p-6" delayMs={120}>
            <h2 className="font-display text-3xl tracking-tight text-black">Write a forum post</h2>
            <p className="mt-2 text-sm text-muted">
              Subject and body only. No links. If you need to share a link, send us an email.
            </p>
            {params.posted === "1" && (
              <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
                Your post is live.
              </p>
            )}
            {errorMessage && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMessage}
              </p>
            )}
            {sessionUser ? (
              <form action={createForumPost} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs text-muted">Subject</label>
                  <input
                    name="subject"
                    type="text"
                    required
                    maxLength={120}
                    className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                    placeholder="What are you trying to build?"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Body</label>
                  <textarea
                    name="body"
                    required
                    maxLength={1200}
                    className="mt-1 h-36 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                    placeholder="Write the details here."
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Post to forum
                </button>
              </form>
            ) : (
              <div className="mt-5 rounded-2xl border border-black/10 bg-white px-4 py-5">
                <p className="text-sm text-black">Sign in before posting.</p>
                <Link
                  href="/login?redirect=/forum"
                  className="mt-4 inline-block rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Sign in
                </Link>
              </div>
            )}
          </MotionReveal>

          <MotionReveal as="section" delayMs={180}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-3xl tracking-tight text-black">Latest posts</h2>
              <p className="text-xs text-muted">{posts.length} total</p>
            </div>
            <div className="mt-5 space-y-4">
              {posts.map((post, index) => (
                <MotionReveal key={post.id} as="article" className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)]" delayMs={240 + index * 70} variant="soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-black">{post.full_name || "Member"}</p>
                      <h3 className="mt-1 font-display text-2xl tracking-tight text-black">{post.subject}</h3>
                    </div>
                    <p className="text-xs text-muted">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted">{post.body}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/forum/${post.id}`}
                      className="rounded-full border border-black/20 px-4 py-1.5 text-xs text-black hover:bg-black hover:text-white"
                    >
                      Open thread
                    </Link>
                    <Link
                      href={sessionUser ? `/forum/${post.id}` : `/login?redirect=${encodeURIComponent(`/forum/${post.id}`)}`}
                      className="text-xs text-muted underline hover:text-black"
                    >
                      +{commentCounts[post.id] ?? 0} comments
                    </Link>
                  </div>
                </MotionReveal>
              ))}
              {posts.length === 0 && (
                <div className="rounded-[28px] border border-black/10 bg-white px-6 py-12 text-center">
                  <p className="text-sm text-black">No posts yet.</p>
                  <p className="mt-1 text-xs text-muted">Be the first to start the conversation.</p>
                </div>
              )}
            </div>
          </MotionReveal>
        </div>
      </div>
    </main>
  );
}

function containsLink(value: string) {
  return /(https?:\/\/|www\.|[a-z0-9-]+\.(com|ca|org|net|io|co|app|dev|ai|gg|ly|me|edu)\b)/i.test(value);
}
