import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MotionReveal } from "@/components/motion-reveal";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  const [
    { data: profile },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (paymentsError) console.error("payments error:", paymentsError);

  const isAdmin = profile?.role === "admin";
  const totalRequests = payments?.length ?? 0;
  const pendingRequests = payments?.filter(p => p.payment_status === "pending").length ?? 0;
  const completedRequests = payments?.filter(p => p.payment_status === "succeeded" || p.payment_status === "completed").length ?? 0;
  const totalSpent = (payments?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0) / 100;
  const displayName = profile?.full_name || user.email?.split("@")[0] || "there";

  return (
    <main className="min-h-screen bg-white text-black">

      {/* Admin banner — only visible to admins */}
      {isAdmin && (
        <div className="fixed inset-x-0 top-[65px] z-30 bg-red-600 px-4 py-2 text-center text-sm text-white">
          You are logged in as an admin.{" "}
          <Link href="/admin" className="font-semibold underline hover:text-red-100">
            Open Master Mode →
          </Link>
        </div>
      )}

      <div className={`grid min-h-screen grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] ${isAdmin ? "pt-8" : ""}`}>

        {/* Sidebar */}
        <aside className="border-b border-black/10 bg-white px-4 py-6 lg:border-b-0 lg:border-r">
          <h1 className="font-display text-xl tracking-[0.2em] uppercase text-black">Dashboard</h1>
          <p className="mt-1 text-xs text-muted">{user.email}</p>

          <nav className="mt-6 space-y-1 text-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted mb-2">My Account</p>
            <a href="#overview" className="block rounded-lg px-3 py-1.5 text-muted hover:bg-black/5 hover:text-black">Overview</a>
            <a href="#requests" className="block rounded-lg px-3 py-1.5 text-muted hover:bg-black/5 hover:text-black">My Requests</a>
            <a href="#account" className="block rounded-lg px-3 py-1.5 text-muted hover:bg-black/5 hover:text-black">Account Info</a>
          </nav>

          {isAdmin && (
            <div className="mt-6 border-t border-black/10 pt-4">
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Admin Panel
              </Link>
              <p className="mt-2 text-center text-[11px] text-muted">Master control for users, requests, refunds, and paid totals.</p>
            </div>
          )}

          <div className="mt-4 border-t border-black/10 pt-4">
            <Link href="/" className="text-xs text-muted underline hover:text-black">← Back to site</Link>
          </div>
        </aside>

        {/* Main content */}
        <section className="px-4 py-8 lg:px-10">

          {/* Welcome */}
          <MotionReveal id="overview">
            <h2 className="font-display text-3xl tracking-tight text-black">Welcome back, {displayName}.</h2>
            <p className="mt-1 text-sm text-muted">Track your requests and account details below.</p>
          </MotionReveal>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <MotionReveal delayMs={80} variant="soft"><StatCard label="Total Requests" value={totalRequests} /></MotionReveal>
            <MotionReveal delayMs={140} variant="soft"><StatCard label="Completed" value={completedRequests} /></MotionReveal>
            <MotionReveal delayMs={200} variant="soft"><StatCard label="Pending" value={pendingRequests} /></MotionReveal>
            <MotionReveal delayMs={260} variant="soft"><StatCard label="Total Spent" value={`$${totalSpent.toFixed(2)}`} /></MotionReveal>
          </div>

          {/* Request / Payment History */}
          <MotionReveal id="requests" className="mt-12" delayMs={100}>
            <h3 className="font-display text-2xl text-black">My Requests</h3>
            <p className="mt-1 text-sm text-muted">All projects and service requests you have submitted.</p>

            <div className="mt-4 space-y-3">
              {(payments ?? []).length === 0 ? (
                <div className="rounded-2xl border border-black/10 px-6 py-12 text-center">
                  <p className="text-sm font-medium text-black">No requests yet</p>
                  <p className="mt-1 text-xs text-muted">Submit a project or service request to get started.</p>
                  <Link
                    href="/order"
                    className="mt-4 inline-block rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    Get Started
                  </Link>
                </div>
              ) : (
                (payments ?? []).map((p, index) => (
                  <MotionReveal key={p.id} className="rounded-2xl border border-black/10 bg-white p-5" delayMs={160 + index * 60} variant="soft">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-semibold text-black">
                            ${((p.amount || 0) / 100).toFixed(2)} {p.currency?.toUpperCase() ?? "CAD"}
                          </p>
                          <StatusBadge status={p.payment_status} />
                          {p.refund_status && p.refund_status !== "none" && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-mono uppercase text-blue-700">
                              {p.refund_status}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          Submitted {new Date(p.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}
                          {" at "}
                          {new Date(p.created_at).toLocaleTimeString("en-CA", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {p.stripe_payment_intent && (
                          <p className="mt-0.5 font-mono text-[11px] text-muted">
                            Ref: {p.stripe_payment_intent.slice(0, 28)}…
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted">
                        <StatusDescription status={p.payment_status} />
                      </div>
                    </div>
                  </MotionReveal>
                ))
              )}
            </div>
          </MotionReveal>

          {/* Account Info */}
          <MotionReveal id="account" className="mt-12" delayMs={140}>
            <h3 className="font-display text-2xl text-black">Account Info</h3>
            <div className="mt-3 rounded-2xl border border-black/10 bg-black/5 p-5 grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="mt-0.5 text-black">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Full Name</p>
                <p className="mt-0.5 text-black">{profile?.full_name || <span className="italic text-muted">Not set</span>}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Account Type</p>
                <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${isAdmin ? "bg-red-100 text-red-700" : "bg-black/10 text-black"}`}>
                  {profile?.role ?? "user"}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted">Member Since</p>
                <p className="mt-0.5 text-black">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })
                    : "—"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-muted">User ID</p>
                <p className="mt-0.5 font-mono text-xs text-muted">{user.id}</p>
              </div>
            </div>
          </MotionReveal>

        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-black/5 px-4 py-4 text-sm">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 font-mono text-lg text-black">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    succeeded: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function StatusDescription({ status }: { status: string }) {
  const descriptions: Record<string, string> = {
    succeeded: "Payment received",
    completed: "Project completed",
    pending: "Awaiting review",
    failed: "Payment failed",
  };
  return <span className="text-muted">{descriptions[status] ?? status}</span>;
}
