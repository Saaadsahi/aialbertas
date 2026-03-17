import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { getSignupErrorMessage } from "@/lib/auth/messages";

export const dynamic = "force-dynamic";

async function signUp(formData: FormData) {
  "use server";

  const fullName = String(formData.get("full_name") ?? "").trim().replace(/\s+/g, " ");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(fullName)) {
    redirect(`/signup?error=${encodeURIComponent("Full name must contain letters only.")}`);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(getSignupErrorMessage(error.message))}`);
  }

  redirect("/");
}

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error =
    params.error ??
    (!hasSupabaseEnv() ? "Supabase is not configured. Add the required environment variables to enable sign-up." : undefined);
  const isConfigured = hasSupabaseEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-sm text-black shadow-sm">
        <h1 className="font-display text-3xl tracking-tight text-black">Create account</h1>
        <p className="mt-2 text-xs text-muted">
          Join AiAlberta&apos;s community of builders, owners, and architects.
        </p>
        {error && (
          <p className="mt-4 rounded-md border border-red-400/40 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}
        <form action={signUp} className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-muted">Full name</label>
            <input
              name="full_name"
              type="text"
              required
              disabled={!isConfigured}
              minLength={2}
              maxLength={60}
              pattern="[A-Za-z]+(?: [A-Za-z]+)*"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
              placeholder="Your name"
              title="Use letters only"
            />
          </div>
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
            <label className="text-xs text-muted">Password</label>
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
            Create Account
          </button>
        </form>
        <p className="mt-4 text-xs text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-black underline">
            Sign in
          </Link>
          .
        </p>
        <Link href="/" className="mt-6 inline-block text-xs text-muted underline">
          Back to site
        </Link>
      </div>
    </main>
  );
}
