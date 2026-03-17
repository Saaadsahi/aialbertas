import { createServerSupabaseClient } from "@/lib/supabase/server";
import { OrderEmailForm } from "@/components/order-email-form";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const profile = user
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle()
    : null;

  const defaultName = profile?.data?.full_name ?? "";
  const defaultEmail = profile?.data?.email ?? user?.email ?? "";

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Send an email
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-black">
            Tell us what you&apos;re building.
          </h1>
          <p className="mt-3 text-sm text-muted">
            Send the details directly by email and we&apos;ll review your request,
            confirm scope, and follow up from there.
          </p>
        </div>

        <OrderEmailForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </div>
    </main>
  );
}
