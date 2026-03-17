import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createOptionalServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function submitInquiry(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const serviceType = String(formData.get("service_type") ?? "General Inquiry");
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=missing");
  }

  const supabase = await createOptionalServerSupabaseClient();
  if (!supabase) {
    redirect("/contact?error=config");
  }

  const { error } = await supabase.from("contact_submissions").insert({
    name,
    email,
    service_type: serviceType,
    message
  });

  if (error) {
    redirect("/contact?error=submit");
  }

  redirect("/contact?sent=1");
}

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string; coffee?: string }>;
}) {
  const params = await searchParams;
  const isConfigured = hasSupabaseEnv();
  const isSent = params.sent === "1";
  const coffeeMessage =
    params.coffee === "on-me"
      ? "Coffee on me selected. Leave your details and we will set it up."
      : params.coffee === "on-you"
        ? "Coffee on you selected. Leave your details and we will follow up."
        : undefined;
  const errorMessage =
    params.error === "config"
      ? "Contact form storage is not configured yet. Use the email link below for now."
      : params.error === "submit"
        ? "We couldn't save your inquiry right now. Please email us directly."
        : params.error === "missing"
          ? "Please fill in your name, email, and message."
          : undefined;

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-20">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">— Get started</MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl sm:text-6xl tracking-tight text-black" delayMs={80}>
          Ready to build?
        </MotionReveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <MotionReveal as="form" action={submitInquiry} className="space-y-4 text-sm text-black" delayMs={140}>
            {coffeeMessage && (
              <p className="rounded-xl border border-black/10 bg-[#f7f4ef] px-3 py-2 text-xs text-black">
                {coffeeMessage}
              </p>
            )}
            {isSent && (
              <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800">
                Inquiry received. We&apos;ll follow up shortly.
              </p>
            )}
            {errorMessage && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {errorMessage}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-muted">Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
                  placeholder="you@company.ca"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted">Service</label>
              <select
                name="service_type"
                className="mt-1 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-black/40"
              >
                <option>General Inquiry</option>
                <option>Automation Workflow</option>
                <option>Custom AI App</option>
                <option>AI Architecture</option>
                <option>Vibe Code Cleanup</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted">Message</label>
              <textarea
                name="message"
                required
                className="mt-1 h-28 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted focus:border-black/40"
                placeholder="Tell us where you're starting from. We'll meet you there."
              />
            </div>
            <button
              type="submit"
              disabled={!isConfigured}
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Submit inquiry
            </button>
            <p className="text-xs text-muted">
              Or email us directly at{" "}
              <a href="mailto:saadullahsahi@gmail.com" className="underline text-black">
                saadullahsahi@gmail.com
              </a>
              .
            </p>
          </MotionReveal>
          <MotionReveal className="space-y-4 text-sm text-muted" delayMs={220} variant="soft">
            <p>
              We respond to most inquiries within one business day. From there,
              we&apos;ll co-design a small, clear first win — usually something
              we can ship in weeks, not months.
            </p>
            <p>
              Whether you&apos;re a developer, an architect, or a curious
              founder, our promise is the same:{" "}
              <span className="font-semibold text-black">no one left behind.</span>
            </p>
          </MotionReveal>
        </div>
      </div>
    </main>
  );
}
