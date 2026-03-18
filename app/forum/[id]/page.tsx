import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createOptionalServerSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/admin";
import { formatForumName } from "@/lib/forum";

async function createForumComment(formData: FormData) {
  "use server";

  const postId = String(formData.get("post_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!postId || !body) {
    redirect(`/forum/${postId}?error=missing`);
  }

  if (containsLink(body)) {
    redirect(`/forum/${postId}?error=links`);
  }

  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/forum/${postId}`)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, is_banned")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_banned) {
    redirect(`/forum/${postId}?error=banned`);
  }

  const displayName = formatForumName(
    profile?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Member"
  );

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: displayName,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    redirect(`/forum/${postId}?error=profile`);
  }

  const { error } = await supabase.from("forum_comments").insert({
    post_id: postId,
    user_id: user.id,
    full_name: displayName,
    body,
  });

  if (error) {
    redirect(`/forum/${postId}?error=submit`);
  }

  redirect(`/forum/${postId}?commented=1`);
}

async function deleteForumPost(formData: FormData) {
  "use server";

  const postId = String(formData.get("post_id") ?? "");
  const supabase = await createOptionalServerSupabaseClient();

  if (!supabase || !postId) {
    redirect("/forum");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/forum/${postId}`)}`);
  }

  const [{ data: profile }, { data: post }] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    supabase.from("forum_posts").select("id, user_id").eq("id", postId).maybeSingle()
  ]);

  if (!post) {
    redirect("/forum");
  }

  const canDelete = profile?.role === "admin" || post.user_id === user.id;
  if (!canDelete) {
    redirect(`/forum/${postId}`);
  }

  await supabase.from("forum_posts").delete().eq("id", postId);
  redirect("/forum");
}

export default async function ForumThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ commented?: string; error?: string }>;
}) {
  const resolvedParams = await params;
  const query = await searchParams;
  const [sessionUser, supabase] = await Promise.all([
    getSessionUser(),
    createOptionalServerSupabaseClient(),
  ]);

  if (!supabase) {
    notFound();
  }

  const [{ data: post }, { data: comments }] = await Promise.all([
    supabase.from("forum_posts").select("*").eq("id", resolvedParams.id).maybeSingle(),
    supabase.from("forum_comments").select("*").eq("post_id", resolvedParams.id).order("created_at", { ascending: true }),
  ]);

  if (!post) {
    notFound();
  }

  const errorMessage =
    query.error === "missing"
      ? "Write a comment before submitting."
      : query.error === "links"
        ? "Links are not allowed in comments. Send us an email instead."
        : query.error === "submit"
          ? "We could not save your comment right now."
          : query.error === "profile"
            ? "We could not prepare your profile for commenting."
          : query.error === "banned"
            ? "Your account is currently banned from commenting."
          : query.error === "config"
            ? "Forum comments are not configured yet."
            : undefined;

  const canDelete = !!sessionUser && (sessionUser.role === "admin" || sessionUser.id === post.user_id);

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-32">
        <MotionReveal className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/forum" className="text-muted hover:text-black">← Back to forum</Link>
          <span className="text-muted">/</span>
          <span className="text-black">{post.subject}</span>
        </MotionReveal>

        <MotionReveal className="mt-6 rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]" delayMs={80}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-black">{post.full_name || "Member"} says...</p>
              <h1 className="mt-2 font-display text-4xl tracking-tight text-black">{post.subject}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs text-muted">{new Date(post.created_at).toLocaleString()}</p>
              {canDelete && (
                <form action={deleteForumPost}>
                  <input type="hidden" name="post_id" value={post.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-red-200 px-4 py-1.5 text-xs text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </form>
              )}
            </div>
          </div>
          <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-black/80">{post.body}</p>
          <p className="mt-6 text-xs text-muted">+{comments?.length ?? 0} comments</p>
        </MotionReveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <MotionReveal as="section" delayMs={140}>
            <h2 className="font-display text-3xl tracking-tight text-black">Comments</h2>
            <div className="mt-5 space-y-4">
              {(comments ?? []).map((comment, index) => (
                <MotionReveal key={comment.id} className="rounded-[24px] border border-black/10 bg-[#fafaf8] p-4" delayMs={180 + index * 70} variant="soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-black">{comment.full_name || "Member"}</p>
                    <p className="text-xs text-muted">{new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted">{comment.body}</p>
                </MotionReveal>
              ))}
              {(comments ?? []).length === 0 && (
                <div className="rounded-[24px] border border-black/10 bg-white px-5 py-8 text-center">
                  <p className="text-sm text-black">No comments yet.</p>
                  <p className="mt-1 text-xs text-muted">Be the first to join this conversation.</p>
                </div>
              )}
            </div>
          </MotionReveal>

          <MotionReveal as="aside" className="rounded-[28px] border border-black/10 bg-[#f8f6f1] p-5" delayMs={200} variant="soft">
            <h2 className="font-display text-2xl tracking-tight text-black">Add comment</h2>
            <p className="mt-2 text-sm text-muted">
              No links here either. If you need to send one, email us instead.
            </p>
            {query.commented === "1" && (
              <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
                Comment added.
              </p>
            )}
            {errorMessage && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMessage}
              </p>
            )}
            {sessionUser ? (
              <form action={createForumComment} className="mt-5 space-y-4">
                <input type="hidden" name="post_id" value={post.id} />
                <textarea
                  name="body"
                  required
                  maxLength={800}
                  className="h-32 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                  placeholder="Add your comment"
                />
                <button
                  type="submit"
                  className="rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Comment
                </button>
              </form>
            ) : (
              <Link
                href={`/login?redirect=${encodeURIComponent(`/forum/${post.id}`)}`}
                className="mt-5 inline-block rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
              >
                Sign in to comment
              </Link>
            )}
          </MotionReveal>
        </div>
      </div>
    </main>
  );
}

function containsLink(value: string) {
  return /(https?:\/\/|www\.|[a-z0-9-]+\.(com|ca|org|net|io|co|app|dev|ai|gg|ly|me|edu)\b)/i.test(value);
}
