import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

const SERVICE_PRICING: Record<string, number> = {
  "Automation Workflow": 150000,
  "Custom AI App": 300000,
  "AI Architecture": 200000,
  "Vibe Code Cleanup": 100000,
  "General Inquiry": 0
};

async function createOrder(formData: FormData) {
  "use server";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/order");
  }

  const serviceType = String(formData.get("service_type") ?? "General Inquiry");
  const description = String(formData.get("description") ?? "");
  const budget = String(formData.get("budget") ?? "");

  const amount = SERVICE_PRICING[serviceType] ?? 0;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      service_type: serviceType,
      description,
      budget_range: budget,
      amount_paid: amount > 0 ? amount / 100 : 0
    })
    .select("*")
    .single();

  if (error || !order) {
    redirect("/dashboard");
  }

  if (!stripe || amount === 0) {
    redirect("/dashboard");
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const sessionStripe = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "cad",
          product_data: {
            name: `AiAlberta – ${serviceType}`,
            description: description || "Service order"
          },
          unit_amount: amount
        },
        quantity: 1
      }
    ],
    metadata: {
      order_id: order.id
    },
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/dashboard?checkout=cancelled`
  });

  await supabase
    .from("orders")
    .update({ stripe_payment_id: sessionStripe.id })
    .eq("id", order.id);

  if (sessionStripe.url) {
    redirect(sessionStripe.url);
  }

  redirect("/dashboard");
}

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

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-24">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
            Order a service
          </p>
          <h1 className="mt-3 font-display text-4xl tracking-tight text-black">
            Tell us what you&apos;re building.
          </h1>
          <p className="mt-3 text-sm text-muted">
            We&apos;ll review your order, confirm scope, and only then finalize
            any long-term engagement. Most projects start small and focused.
          </p>
        </div>

        <form action={createOrder} className="space-y-4 text-sm text-black">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted">Name</label>
              <input
                type="text"
                value={profile?.data?.full_name ?? ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-black/15 bg-gray-50 px-3 py-2 text-sm text-black outline-none ring-0 placeholder:text-muted"
              />
            </div>
            <div>
              <label className="text-xs text-muted">Email</label>
              <input
                type="email"
                value={profile?.data?.email ?? user?.email ?? ""}
                readOnly
                className="mt-1 w-full rounded-xl border border-black/15 bg-gray-50 px-3 py-2 text-sm text-black outline-none ring-0 placeholder:text-muted"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted">Service type</label>
            <select
              name="service_type"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 focus:border-black/40"
            >
              <option>Automation Workflow</option>
              <option>Custom AI App</option>
              <option>AI Architecture</option>
              <option>Vibe Code Cleanup</option>
              <option>General Inquiry</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">Project description</label>
            <textarea
              name="description"
              className="mt-1 h-32 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 placeholder:text-muted focus:border-black/40"
              placeholder="Where are you today, and what would 'no one left behind' look like for your team?"
            />
          </div>
          <div>
            <label className="text-xs text-muted">Budget range</label>
            <select
              name="budget"
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-black outline-none ring-0 focus:border-black/40"
            >
              <option value="under-5k">Under $5k</option>
              <option value="5-15k">$5k – $15k</option>
              <option value="15-50k">$15k – $50k</option>
              <option value="50k-plus">$50k+</option>
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Continue to secure checkout
          </button>
        </form>
      </div>
    </main>
  );
}
