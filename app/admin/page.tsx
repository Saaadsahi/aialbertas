import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth/admin";
import { refundOrderPayment } from "@/lib/stripe/refunds";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function updatePaymentStatus(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const adminSupabase = getAdminSupabaseClient();
  await adminSupabase.from("payments").update({ payment_status: status }).eq("id", id);
}

async function deletePayment(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  const adminSupabase = getAdminSupabaseClient();
  await adminSupabase.from("payments").delete().eq("id", id);
}

async function refundPayment(formData: FormData) {
  "use server";
  const { user: adminUser } = await requireAdminSession();
  const id = String(formData.get("id"));
  const stripePaymentIntent = String(formData.get("stripe_payment_intent") ?? "");
  const adminSupabase = getAdminSupabaseClient();

  const { data: payment } = await adminSupabase
    .from("payments")
    .select("refund_status, amount, stripe_payment_intent")
    .eq("id", id)
    .maybeSingle();

  if (!payment || payment.refund_status === "refunded" || !payment.stripe_payment_intent) {
    throw new Error("Payment cannot be refunded");
  }

  await refundOrderPayment(stripePaymentIntent || null);

  await adminSupabase.from("refunds").insert({
    payment_id: id,
    processed_by: adminUser.id,
    amount: payment.amount,
    reason: "Admin refund",
  });

  await adminSupabase.from("payments").update({ refund_status: "refunded" }).eq("id", id);
}

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const adminSupabase = getAdminSupabaseClient();
  const { user: adminUser } = await requireAdminSession();
  const params = await searchParams;

  const [
    { data: { users: authUsers } },
    { data: profiles },
    { data: payments },
    { data: refunds },
    { data: coffeeChats },
  ] = await Promise.all([
    adminSupabase.auth.admin.listUsers(),
    adminSupabase.from("profiles").select("*").order("created_at", { ascending: false }),
    adminSupabase.from("payments").select("*").order("created_at", { ascending: false }),
    adminSupabase.from("refunds").select("*").order("created_at", { ascending: false }),
    adminSupabase.from("coffee_chats").select("*").order("created_at", { ascending: false }),
  ]);

  const safeProfiles = profiles ?? [];
  const safePayments = payments ?? [];
  const safeRefunds = refunds ?? [];
  const safeCoffeeChats = coffeeChats ?? [];

  const usersWithDetails = safeProfiles.map((profile) => {
    const authUser = authUsers?.find((item) => item.id === profile.id);
    const userPayments = safePayments.filter((payment) => payment.user_id === profile.id);
    const totalSpentCents = userPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const paidPayments = userPayments.filter(
      (payment) => payment.payment_status === "succeeded" || payment.payment_status === "completed"
    );

    return {
      ...profile,
      role: (profile.role ?? "user") as string,
      last_sign_in: authUser?.last_sign_in_at,
      createdAt: authUser?.created_at ?? profile.created_at,
      paymentCount: userPayments.length,
      pendingCount: userPayments.filter((payment) => payment.payment_status === "pending").length,
      totalSpent: totalSpentCents / 100,
      hasPaid: paidPayments.length > 0,
      paidCount: paidPayments.length,
      emailConfirmed: Boolean(authUser?.email_confirmed_at),
    };
  });

  const totalRevenueCents = safePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const refundedCents = safeRefunds.reduce((sum, refund) => sum + (refund.amount || 0), 0);
  const netRevenue = (totalRevenueCents - refundedCents) / 100;
  const totalRevenue = totalRevenueCents / 100;
  const pendingRequests = safePayments.filter((payment) => payment.payment_status === "pending").length;
  const paidPayments = safePayments.filter(
    (payment) => payment.payment_status === "succeeded" || payment.payment_status === "completed"
  );
  const paidUserIds = new Set(
    paidPayments.map((payment) => payment.user_id).filter((value): value is string => Boolean(value))
  );
  const adminCount = safeProfiles.filter((profile) => profile.role === "admin").length;
  const tab = params.tab ?? "overview";

  const tabs = [
    { id: "overview", label: "Master Mode" },
    { id: "users", label: `Users (${safeProfiles.length})` },
    { id: "payments", label: `Requests & Payments (${safePayments.length})` },
    { id: "coffee", label: `Coffee Chats (${safeCoffeeChats.length})` },
  ];

  const recentPendingPayments = safePayments.filter((payment) => payment.payment_status === "pending").slice(0, 6);
  const recentRefunds = safeRefunds.slice(0, 6);
  const recentCoffeeChats = safeCoffeeChats.slice(0, 6);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-black/10 bg-black px-4 py-6 text-white lg:border-b-0 lg:border-r">
          <Link href="/">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-white">← Back to site</p>
          </Link>
          <h1 className="mt-4 font-display text-2xl uppercase tracking-[0.15em]">Master Mode</h1>
          <p className="mt-1 text-xs text-white/50">{adminUser.email}</p>

          <nav className="mt-8 space-y-1">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Control</p>
            {tabs.map((item) => (
              <Link
                key={item.id}
                href={`/admin?tab=${item.id}`}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  tab === item.id ? "bg-white font-medium text-black" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Admin Access</p>
            <p className="mt-2 text-sm text-white">
              This area is limited to admins only. It controls users, requests, payment states, and refunds.
            </p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 space-y-1">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">Quick Links</p>
            <Link href="/admin/users/new" className="block rounded-lg px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
              Add user
            </Link>
            <Link href="/dashboard" className="block rounded-lg px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
              Dashboard
            </Link>
            <Link href="/order" target="_blank" className="block rounded-lg px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 hover:text-white">
              Order page ↗
            </Link>
          </div>
        </aside>

        <section className="px-4 py-8 lg:px-10">
          {tab === "overview" && (
            <div>
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-red-700">Admin Only</p>
                <h2 className="mt-2 font-display text-3xl text-black">Master control for the platform.</h2>
                <p className="mt-2 max-w-3xl text-sm text-black/70">
                  Review users, edit account access, inspect requests, update payment status, and refund paid orders from one place.
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard label="Total Users" value={safeProfiles.length} tone="dark" />
                <MetricCard label="Admins" value={adminCount} />
                <MetricCard label="Pending Requests" value={pendingRequests} />
                <MetricCard label="Gross Paid" value={`$${totalRevenue.toFixed(2)}`} />
                <MetricCard label="Net After Refunds" value={`$${netRevenue.toFixed(2)}`} tone="green" />
              </div>

              <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-black/10 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-2xl text-black">Users Requiring Attention</h3>
                      <p className="mt-1 text-sm text-muted">Recent accounts, pending requests, paid status, and last sign-in.</p>
                    </div>
                    <Link href="/admin?tab=users" className="rounded-full border border-black/15 px-3 py-1.5 text-xs text-black hover:bg-black hover:text-white">
                      View all users
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {usersWithDetails.slice(0, 8).map((user) => (
                      <Link
                        key={user.id}
                        href={`/admin/users/${user.id}`}
                        className="block rounded-2xl border border-black/10 bg-black/[0.02] p-4 transition-colors hover:border-black/30 hover:bg-black/5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-black">{user.email}</p>
                              <RoleBadge role={user.role} />
                              {user.hasPaid && <InlineBadge label="paid" tone="green" />}
                              {!user.emailConfirmed && <InlineBadge label="email unconfirmed" tone="yellow" />}
                            </div>
                            {user.full_name && <p className="mt-0.5 text-xs text-muted">{user.full_name}</p>}
                            <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
                              <span>Requests: {user.paymentCount}</span>
                              <span>Pending: {user.pendingCount}</span>
                              <span>Total paid: ${user.totalSpent.toFixed(2)}</span>
                              <span>Last login: {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : "Never"}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted">Open →</span>
                        </div>
                      </Link>
                    ))}
                    {usersWithDetails.length === 0 && <p className="text-sm text-muted">No users yet.</p>}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-black/10 bg-white p-5">
                    <h3 className="font-display text-2xl text-black">Queue</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <QueueRow label="Paid users" value={paidUserIds.size} />
                      <QueueRow label="Paid payments" value={paidPayments.length} />
                      <QueueRow label="Refunds issued" value={safeRefunds.length} />
                      <QueueRow label="Coffee chats" value={safeCoffeeChats.length} />
                      <QueueRow label="Refund total" value={`$${(refundedCents / 100).toFixed(2)}`} />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl text-black">Pending Requests</h3>
                      <Link href="/admin?tab=payments" className="text-xs text-muted underline hover:text-black">Open list</Link>
                    </div>
                    <div className="mt-4 space-y-3">
                      {recentPendingPayments.map((payment) => {
                        const profile = safeProfiles.find((item) => item.id === payment.user_id);
                        return (
                          <div key={payment.id} className="rounded-2xl border border-black/10 px-4 py-3">
                            <p className="text-sm font-semibold text-black">{profile?.email ?? "Unknown user"}</p>
                            <p className="mt-1 text-xs text-muted">
                              ${((payment.amount || 0) / 100).toFixed(2)} {payment.currency?.toUpperCase() ?? "CAD"} · {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                      {recentPendingPayments.length === 0 && <p className="text-sm text-muted">No pending requests.</p>}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl text-black">Recent Refunds</h3>
                      <span className="text-xs text-muted">{safeRefunds.length} total</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {recentRefunds.map((refund) => {
                        const payment = safePayments.find((item) => item.id === refund.payment_id);
                        const profile = safeProfiles.find((item) => item.id === payment?.user_id);
                        return (
                          <div key={refund.id} className="rounded-2xl border border-black/10 px-4 py-3">
                            <p className="text-sm font-semibold text-black">{profile?.email ?? "Unknown user"}</p>
                            <p className="mt-1 text-xs text-muted">
                              ${((refund.amount || 0) / 100).toFixed(2)} refunded · {new Date(refund.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        );
                      })}
                      {recentRefunds.length === 0 && <p className="text-sm text-muted">No refunds yet.</p>}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-2xl text-black">Coffee Chats</h3>
                      <Link href="/admin?tab=coffee" className="text-xs text-muted underline hover:text-black">Open list</Link>
                    </div>
                    <div className="mt-4 space-y-3">
                      {recentCoffeeChats.map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-black/10 px-4 py-3">
                          <p className="text-sm font-semibold text-black">{entry.full_name || entry.email || "Unknown user"}</p>
                          <p className="mt-1 text-xs text-muted">
                            {formatCoffeePick(entry.coffee_pick)} · {entry.email ?? "No email"} · {new Date(entry.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      {recentCoffeeChats.length === 0 && <p className="text-sm text-muted">No coffee chats yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl text-black">Users</h2>
                  <p className="mt-1 text-sm text-muted">Admin-only user management for email, password, role, and request history.</p>
                </div>
                <Link href="/admin/users/new" className="rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-gray-800">
                  + Add User
                </Link>
              </div>
              <div className="mt-6 space-y-3">
                {usersWithDetails.map((user) => (
                  <Link
                    key={user.id}
                    href={`/admin/users/${user.id}`}
                    className="block rounded-2xl border border-black/10 bg-white p-4 transition-colors hover:border-black/30 hover:bg-black/5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-black">{user.email}</p>
                          <RoleBadge role={user.role} />
                          {user.hasPaid && <InlineBadge label="paid" tone="green" />}
                          {!user.emailConfirmed && <InlineBadge label="email unconfirmed" tone="yellow" />}
                        </div>
                        {user.full_name && <p className="mt-0.5 text-xs text-muted">{user.full_name}</p>}
                        <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
                          <span>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                          <span>Last login: {user.last_sign_in ? new Date(user.last_sign_in).toLocaleDateString() : "Never"}</span>
                          <span>Requests: {user.paymentCount}</span>
                          <span>Pending: {user.pendingCount}</span>
                          <span>Total paid: ${user.totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted">View & edit →</span>
                    </div>
                  </Link>
                ))}
                {usersWithDetails.length === 0 && <p className="text-sm text-muted">No users yet.</p>}
              </div>
            </div>
          )}

          {tab === "payments" && (
            <div>
              <div>
                <h2 className="font-display text-3xl text-black">Requests & Payments</h2>
                <p className="mt-1 text-sm text-muted">
                  Review paid orders, pending requests, refund state, and total money collected.
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-4">
                <MetricCard label="All Requests" value={safePayments.length} />
                <MetricCard label="Pending Review" value={pendingRequests} />
                <MetricCard label="Paid" value={paidPayments.length} tone="green" />
                <MetricCard label="Refunded" value={safeRefunds.length} tone="red" />
              </div>
              <div className="mt-6 space-y-3">
                {safePayments.map((payment) => {
                  const profile = safeProfiles.find((item) => item.id === payment.user_id);
                  const canRefund =
                    !!payment.stripe_payment_intent &&
                    payment.refund_status !== "refunded" &&
                    (payment.payment_status === "succeeded" || payment.payment_status === "completed");

                  return (
                    <div key={payment.id} className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono font-semibold text-black">
                              ${((payment.amount || 0) / 100).toFixed(2)} {payment.currency?.toUpperCase() ?? "USD"}
                            </p>
                            <PaymentBadge status={payment.payment_status} />
                            {payment.refund_status !== "none" && payment.refund_status && (
                              <InlineBadge label={payment.refund_status} tone="blue" />
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted">
                            By:{" "}
                            <Link href={`/admin/users/${payment.user_id}`} className="underline hover:text-black">
                              {profile?.email ?? "Unknown"}
                            </Link>
                          </p>
                          <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
                            <span>{new Date(payment.created_at).toLocaleString()}</span>
                            {payment.stripe_payment_intent && (
                              <span className="font-mono">{payment.stripe_payment_intent.slice(0, 24)}…</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={updatePaymentStatus} className="flex items-center gap-1">
                            <input type="hidden" name="id" value={payment.id} />
                            <select name="status" defaultValue={payment.payment_status} className="rounded-lg border border-black/15 bg-white px-2 py-1 text-xs">
                              <option value="pending">pending</option>
                              <option value="succeeded">succeeded</option>
                              <option value="completed">completed</option>
                              <option value="failed">failed</option>
                            </select>
                            <button type="submit" className="rounded-lg bg-black px-3 py-1 text-xs text-white hover:bg-gray-800">
                              Update
                            </button>
                          </form>
                          {canRefund && (
                            <form action={refundPayment}>
                              <input type="hidden" name="id" value={payment.id} />
                              <input type="hidden" name="stripe_payment_intent" value={payment.stripe_payment_intent} />
                              <button
                                type="submit"
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100"
                              >
                                Refund money
                              </button>
                            </form>
                          )}
                          <form action={deletePayment}>
                            <input type="hidden" name="id" value={payment.id} />
                            <button type="submit" className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-700 hover:bg-red-100">
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {safePayments.length === 0 && <p className="text-sm text-muted">No requests or payments yet.</p>}
              </div>
            </div>
          )}

          {tab === "coffee" && (
            <div>
              <div>
                <h2 className="font-display text-3xl text-black">Coffee Chats</h2>
                <p className="mt-1 text-sm text-muted">
                  Homepage coffee responses saved to the database for admin review.
                </p>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <MetricCard label="Total Coffee Chats" value={safeCoffeeChats.length} />
                <MetricCard
                  label="Coffee On Me"
                  value={safeCoffeeChats.filter((entry) => entry.coffee_pick === "coffee_on_me").length}
                />
                <MetricCard
                  label="Coffee On You"
                  value={safeCoffeeChats.filter((entry) => entry.coffee_pick === "coffee_on_you").length}
                />
              </div>
              <div className="mt-6 space-y-3">
                {safeCoffeeChats.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-black">{entry.full_name || "Unknown name"}</p>
                          <InlineBadge label={formatCoffeePick(entry.coffee_pick)} tone="blue" />
                        </div>
                        <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
                          <span>{entry.email ?? "No email"}</span>
                          <span>User ID: {entry.user_id}</span>
                          <span>{new Date(entry.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {safeCoffeeChats.length === 0 && <p className="text-sm text-muted">No coffee chat entries yet.</p>}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function formatCoffeePick(value: string) {
  if (value === "coffee_on_me") return "Coffee on me";
  if (value === "coffee_on_you") return "Coffee on you";
  return value;
}

function MetricCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "dark" | "green" | "red";
}) {
  const styles: Record<string, string> = {
    default: "border-black/10 bg-black/5 text-black",
    dark: "border-black bg-black text-white",
    green: "border-green-200 bg-green-50 text-green-900",
    red: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div className={`rounded-3xl border px-5 py-5 ${styles[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="mt-2 font-mono text-2xl">{value}</p>
    </div>
  );
}

function QueueRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-black">{value}</span>
    </div>
  );
}

function InlineBadge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "yellow" | "blue";
}) {
  const styles = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${styles[tone]}`}>
      {label}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
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

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono uppercase ${role === "admin" ? "bg-black text-white" : "bg-black/10 text-black"}`}>
      {role}
    </span>
  );
}
