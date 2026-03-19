import { Nav } from "@/components/nav";
import { DeliveryMap } from "@/components/delivery-map";
import { MotionReveal } from "@/components/motion-reveal";
import Link from "next/link";

const services = [
  {
    title: "Vibe Code Cleanup",
    emoji: "🛠️",
    body: "We refactor brittle scripts and half-finished projects into clean, documented foundations you can build on."
  },
  {
    title: "Custom Sites",
    emoji: "📱",
    body: "Custom websites built to feel polished on every screen, whether someone shows up from an Apple device or a Samsung phone."
  },
  {
    title: "Custom AI Workflows",
    emoji: "⚡",
    body: "We design AI workflows for intake, follow-up, internal knowledge retrieval, and repetitive operational work so your team moves faster without adding chaos."
  }
];

export default function ServicesPage() {
  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-20">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">— What we do</MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl sm:text-6xl tracking-tight text-black" delayMs={80}>
          Your AI. Built right.
        </MotionReveal>
        <MotionReveal as="p" className="mt-4 max-w-xl text-sm text-muted" delayMs={140}>
          Think of us as <span className="font-semibold text-black">911 for your tech needs.</span>{" "}
          If it touches automation, AI, or data — we can design it, build it, and keep it running.
        </MotionReveal>

        <div className="mt-14">
          <DeliveryMap showCta />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map((card, i) => (
            <MotionReveal
              key={card.title}
              className="rounded-3xl border border-black/10 bg-black/5 p-6 text-sm"
              delayMs={180 + i * 90}
              variant="soft"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-2xl tracking-tight text-black">{card.title}</h3>
                <span className="text-3xl">{card.emoji}</span>
              </div>
              <p className="mt-3 text-muted">{card.body}</p>
              <div className="mt-6 flex justify-end">
                <Link
                  href="/order"
                  className="rounded-full bg-black px-4 py-1.5 text-xs text-white hover:bg-gray-800"
                >
                  Order now
                </Link>
              </div>
            </MotionReveal>
          ))}
        </div>
      </div>
    </main>
  );
}
