import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getLoginErrorMessage } from "@/lib/auth/messages";

export const dynamic = "force-dynamic";

async function signIn(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/");

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(getLoginErrorMessage(error.message))}&redirect=${encodeURIComponent(redirectTo)}`);
  }

  // Role-based redirect: admins go to homepage, everyone else goes to redirectTo
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      redirect("/");
    }
  }

  redirect(redirectTo);
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const error =
    params.error ??
    (!hasSupabaseEnv() ? "Supabase is not configured. Add the required environment variables to enable sign-in." : undefined);
  const isConfigured = hasSupabaseEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-sm text-black shadow-sm">
        <h1 className="font-display text-3xl tracking-tight text-black">Sign in</h1>
        <p className="mt-2 text-xs text-muted">
          Welcome back to AiAlberta. No one left behind.
        </p>
        {error && (
          <p className="mt-4 rounded-md border border-red-400/40 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <form action={signIn} className="mt-6 space-y-4">
          <input type="hidden" name="redirect" value={params.redirect ?? "/"} />
          <div>
            <label className="text-xs text-muted">Email</label>
            <input
              name="email"
              type="email"
              required
              disabled={!isConfigured}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
              placeholder="you@company.ca"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted">Password</label>
              <Link href="/forgot-password" className="text-xs text-muted underline hover:text-black">
                Forgot password?
              </Link>
            </div>
            <input
              name="password"
              type="password"
              required
              disabled={!isConfigured}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={!isConfigured}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Sign In
          </button>
        </form>
        <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f4ef] px-4 py-3">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
            New here?
          </p>
          <p className="mt-2 text-sm text-black">
            Sign up or create your account to join AiAlberta.
          </p>
          <Link
            href="/signup"
            className="mt-3 inline-flex items-center rounded-full border border-black/20 bg-white px-4 py-2 text-sm text-black transition-colors hover:bg-black hover:text-white"
          >
            Create account
          </Link>
        </div>
        <Link href="/" className="mt-6 inline-block text-xs text-muted underline">
          Back to site
        </Link>
      </div>
    </main>
  );
}
