import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import { ContactEmailForm } from "@/components/contact-email-form";

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; coffee?: string }>;
}) {
  const params = await searchParams;
  const coffeeMessage =
    params.coffee === "on-me"
      ? "Coffee on me selected. Leave your details and we will set it up."
      : params.coffee === "on-you"
        ? "Coffee on you selected. Leave your details and we will follow up."
        : undefined;
  const errorMessage =
    params.error === "missing"
      ? "Please fill in your name, email, and message."
      : undefined;

  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-32">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          - Get started
        </MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl tracking-tight text-black sm:text-6xl" delayMs={80}>
          Ready to build?
        </MotionReveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <MotionReveal delayMs={140}>
            <ContactEmailForm coffeeMessage={coffeeMessage} errorMessage={errorMessage} />
          </MotionReveal>
          <MotionReveal className="space-y-4 text-sm text-muted" delayMs={220} variant="soft">
            <p>
              We respond to most inquiries within one business day. From there,
              we&apos;ll co-design a small, clear first win - usually something
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
