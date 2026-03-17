import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function createUser(formData: FormData) {
  "use server";
  await requireAdminSession();
  const email = String(formData.get("email"));
  const fullName = String(formData.get("full_name") ?? "").trim();
  const password = String(formData.get("password"));
  const makeAdmin = formData.get("is_admin") === "on";
  const adminSupabase = getAdminSupabaseClient();

  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (error || !data.user) redirect("/admin/users/new?error=1");

  const profileUpdates: { full_name?: string; role?: string } = {};
  if (fullName) profileUpdates.full_name = fullName;
  if (makeAdmin) profileUpdates.role = "admin";

  if (Object.keys(profileUpdates).length > 0) {
    await adminSupabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", data.user.id);
  }

  redirect(`/admin/users/${data.user.id}?saved=1`);
}

export default async function NewUserPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdminSession();
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="flex items-center gap-3">
          <Link href="/admin?tab=users" className="text-sm text-muted hover:text-black">← Users</Link>
          <span className="text-muted">/</span>
          <p className="text-sm font-medium text-black">New User</p>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-6">
          <h1 className="font-display text-2xl text-black">Add User</h1>
          <p className="mt-1 text-sm text-muted">Create a new account manually.</p>

          {params.error && (
            <p className="mt-4 rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              Failed to create user. Email may already be in use.
            </p>
          )}

          <form action={createUser} className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-muted">Full Name</label>
              <input name="full_name" type="text" className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40" placeholder="Customer name" />
            </div>
            <div>
              <label className="text-xs text-muted">Email</label>
              <input name="email" type="email" required className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40" placeholder="user@company.ca" />
            </div>
            <div>
              <label className="text-xs text-muted">Password</label>
              <input name="password" type="password" required minLength={6} className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-black/40" placeholder="Min 6 characters" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" name="is_admin" id="is_admin" className="h-4 w-4 rounded border-black/20" />
              <label htmlFor="is_admin" className="text-sm text-black">Grant admin access</label>
            </div>
            <button type="submit" className="w-full rounded-full bg-black py-2 text-sm text-white hover:bg-gray-800">
              Create User
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
