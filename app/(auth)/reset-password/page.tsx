"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");

    if (!tokenHash || type !== "recovery") {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    const supabase = createBrowserSupabaseClient();
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: "recovery" })
      .then(({ error }) => {
        if (error) {
          setError("This reset link has expired. Please request a new one.");
        } else {
          setVerified(true);
        }
      });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirm = (form.elements.namedItem("confirm") as HTMLInputElement).value;

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-8 text-sm text-black shadow-sm">
        <h1 className="font-display text-3xl tracking-tight text-black">New password</h1>
        <p className="mt-2 text-xs text-muted">Choose a new password for your account.</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}{" "}
            {error.includes("expired") && (
              <Link href="/forgot-password" className="underline hover:text-red-900">
                Request new link
              </Link>
            )}
          </div>
        )}

        {done ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            Password updated. Redirecting to dashboard…
          </div>
        ) : verified ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-muted">New password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-xs text-muted">Confirm password</label>
              <input
                name="confirm"
                type="password"
                required
                minLength={6}
                className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Updating…" : "Update Password"}
            </button>
          </form>
        ) : !error ? (
          <p className="mt-6 text-xs text-muted">Verifying link…</p>
        ) : null}

        <Link href="/login" className="mt-6 inline-block text-xs text-muted underline">
          Back to sign in
        </Link>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
