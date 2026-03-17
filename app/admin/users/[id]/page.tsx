import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth/admin";
import { refundOrderPayment } from "@/lib/stripe/refunds";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function updateUser(formData: FormData) {
  "use server";
  const { user: adminUser } = await requireAdminSession();
  const id = String(formData.get("id"));
  const email = String(formData.get("email"));
  const fullName = String(formData.get("full_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const makeAdmin = formData.get("is_admin") === "on";
  const adminSupabase = getAdminSupabaseClient();

  await adminSupabase
    .from("profiles")
    .update({
      email,
      full_name: fullName,
      role: makeAdmin ? "admin" : "user",
    })
    .eq("id", id);

  const { data: authLookup } = await adminSupabase.auth.admin.getUserById(id);
  const existingMetadata =
    authLookup.user?.user_metadata && typeof authLookup.user.user_metadata === "object"
      ? authLookup.user.user_metadata
      : {};

  const authUpdate: {
    email: string;
    password?: string;
    user_metadata: Record<string, unknown>;
  } = {
    email,
    user_metadata: {
      ...existingMetadata,
      full_name: fullName,
      updated_by_admin: adminUser.id,
    },
  };

  if (password.length >= 6) {
    authUpdate.password = password;
  }

  await adminSupabase.auth.admin.updateUserById(id, authUpdate);
  redirect(`/admin/users/${id}?saved=1`);
}

async function deleteUser(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  const adminSupabase = getAdminSupabaseClient();
  await adminSupabase.auth.admin.deleteUser(id);
  redirect("/admin?tab=users");
}

async function updatePaymentStatus(formData: FormData) {
  "use server";
  await requireAdminSession();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const userId = String(formData.get("user_id"));
  const adminSupabase = getAdminSupabaseClient();
  await adminSupabase.from("payments").update({ payment_status: status }).eq("id", id);
  redirect(`/admin/users/${userId}`);
}

async function refundPayment(formData: FormData) {
  "use server";
  const { user: adminUser } = await requireAdminSession();
  const id = String(formData.get("id"));
  const userId = String(formData.get("user_id"));
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
  redirect(`/admin/users/${userId}`);
}

export default async function UserDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const adminSupabase = getAdminSupabaseClient();
  await requireAdminSession();
  const query = await searchParams;
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  const [
    { data: profile },
    { data: payments },
    { data: refunds },
    { data: { user: authUser } }
  ] = await Promise.all([
    adminSupabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    adminSupabase.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    adminSupabase
      .from("refunds")
      .select("*, payments!inner(user_id)")
      .eq("payments.user_id", userId)
      .order("created_at", { ascending: false }),
    adminSupabase.auth.admin.getUserById(userId)
  ]);

  if (!profile) redirect("/admin?tab=users");

  const safePayments = payments ?? [];
  const safeRefunds = refunds ?? [];
  const isAdmin = profile.role === "admin";
  const totalSpentCents = safePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const refundedCents = safeRefunds.reduce((sum, refund) => sum + (refund.amount || 0), 0);
  const totalSpent = totalSpentCents / 100;
  const totalRefunded = refundedCents / 100;
  const hasPaid = safePayments.some(
    (payment) => payment.payment_status === "succeeded" || payment.payment_status === "completed"
  );

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin?tab=users" className="text-sm text-muted hover:text-black">← Users</Link>
            <span className="text-muted">/</span>
            <p className="text-sm font-medium text-black">{profile.email}</p>
          </div>
          {query.saved && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">Saved successfully</span>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Requests" value={safePayments.length} />
          <StatCard label="Total Paid" value={`$${totalSpent.toFixed(2)}`} />
          <StatCard label="Refunded" value={`$${totalRefunded.toFixed(2)}`} tone="blue" />
          <StatCard label="Status" value={hasPaid ? "Paid" : "Unpaid"} tone={hasPaid ? "green" : "default"} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <h2 className="font-display text-2xl text-black">Edit User</h2>
              <p className="mt-1 text-xs text-muted">
                Joined: {profile.created_at ? new Date(profile.created_at).toLocaleString() : "—"} · Last login:{" "}
                {authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleString() : "Never"}
              </p>

              <form action={updateUser} className="mt-6 space-y-4">
                <input type="hidden" name="id" value={userId} />
                <div>
                  <label className="text-xs text-muted">Full Name</label>
                  <input
                    name="full_name"
                    type="text"
                    defaultValue={profile.full_name ?? ""}
                    className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={profile.email ?? ""}
                    className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">New Password <span className="text-muted">(leave blank to keep current one)</span></label>
                  <input
                    name="password"
                    type="password"
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="is_admin"
                    id="is_admin"
                    defaultChecked={isAdmin}
                    className="h-4 w-4 rounded border-black/20"
                  />
                  <label htmlFor="is_admin" className="text-sm text-black">Admin access</label>
                </div>
                <div className="pt-2">
                  <button type="submit" className="rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800">
                    Save User Changes
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-3xl border border-black/10 bg-black/5 p-6">
              <h3 className="font-display text-xl text-black">Account Review</h3>
              <div className="mt-4 space-y-3 text-sm">
                <InfoRow label="User ID" value={userId} mono />
                <InfoRow label="Role" value={profile.role ?? "user"} />
                <InfoRow label="Email confirmed" value={authUser?.email_confirmed_at ? "Yes" : "No"} />
                <InfoRow label="Created in Auth" value={authUser?.created_at ? new Date(authUser.created_at).toLocaleString() : "—"} />
              </div>
            </div>

            <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
              <h3 className="font-display text-xl text-red-900">Danger Zone</h3>
              <p className="mt-1 text-sm text-red-800">Delete this user and all linked profile/payment data.</p>
              <div className="mt-4">
                <form action={deleteUser}>
                  <input type="hidden" name="id" value={userId} />
                  <button type="submit" className="rounded-full border border-red-300 bg-white px-6 py-2 text-sm text-red-700 hover:bg-red-100">
                    Delete User Permanently
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl text-black">Requests & Payments</h2>
                  <p className="mt-1 text-sm text-muted">Change payment state, inspect paid status, and refund money if needed.</p>
                </div>
                <RoleBadge role={profile.role ?? "user"} />
              </div>
              <div className="mt-4 space-y-3">
                {safePayments.map((payment) => {
                  const canRefund =
                    !!payment.stripe_payment_intent &&
                    payment.refund_status !== "refunded" &&
                    (payment.payment_status === "succeeded" || payment.payment_status === "completed");

                  return (
                    <div key={payment.id} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono font-semibold text-black">
                              ${((payment.amount || 0) / 100).toFixed(2)} {payment.currency?.toUpperCase() ?? "USD"}
                            </p>
                            <PaymentBadge status={payment.payment_status} />
                            {payment.refund_status !== "none" && payment.refund_status && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-mono uppercase text-blue-700">
                                {payment.refund_status}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted">
                            <span>{new Date(payment.created_at).toLocaleString()}</span>
                            {payment.stripe_payment_intent && (
                              <span className="font-mono">{payment.stripe_payment_intent.slice(0, 28)}…</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <form action={updatePaymentStatus} className="flex items-center gap-1">
                            <input type="hidden" name="id" value={payment.id} />
                            <input type="hidden" name="user_id" value={userId} />
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
                              <input type="hidden" name="user_id" value={userId} />
                              <input type="hidden" name="stripe_payment_intent" value={payment.stripe_payment_intent} />
                              <button
                                type="submit"
                                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs text-blue-700 hover:bg-blue-100"
                              >
                                Refund money
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {safePayments.length === 0 && (
                  <p className="rounded-2xl border border-black/10 px-4 py-6 text-center text-sm text-muted">No payments yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6">
              <h3 className="font-display text-2xl text-black">Refund History</h3>
              <div className="mt-4 space-y-3">
                {safeRefunds.map((refund) => (
                  <div key={refund.id} className="rounded-2xl border border-black/10 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-sm text-black">${((refund.amount || 0) / 100).toFixed(2)}</p>
                      <p className="text-xs text-muted">{new Date(refund.created_at).toLocaleString()}</p>
                    </div>
                    {refund.reason && <p className="mt-1 text-xs text-muted">{refund.reason}</p>}
                  </div>
                ))}
                {safeRefunds.length === 0 && <p className="text-sm text-muted">No refunds for this user.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "green" | "blue";
}) {
  const styles = {
    default: "border-black/10 bg-black/5 text-black",
    green: "border-green-200 bg-green-50 text-green-900",
    blue: "border-blue-200 bg-blue-50 text-blue-900",
  };

  return (
    <div className={`rounded-2xl border px-4 py-4 ${styles[tone]}`}>
      <p className="text-xs opacity-70">{label}</p>
      <p className="mt-1 font-mono text-xl">{value}</p>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-black/10 bg-white px-4 py-3">
      <span className="text-xs text-muted">{label}</span>
      <span className={mono ? "font-mono text-xs text-black break-all" : "text-sm text-black"}>{value}</span>
    </div>
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
