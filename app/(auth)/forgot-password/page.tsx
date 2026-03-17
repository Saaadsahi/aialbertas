import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

async function sendResetEmail(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "");
  const supabase = await createServerSupabaseClient();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  // Always redirect to sent=1 — never reveal if the email exists
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/reset-password`
  });

  redirect("/forgot-password?sent=1");
}

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const isConfigured = hasSupabaseEnv();

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-sm text-black shadow-sm">
        <h1 className="font-display text-3xl tracking-tight text-black">Reset password</h1>
        <p className="mt-2 text-xs text-muted">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            If an account with that email exists, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form action={sendResetEmail} className="mt-6 space-y-4">
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
            <button
              type="submit"
              disabled={!isConfigured}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <Link href="/login" className="mt-6 inline-block text-xs text-muted underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
