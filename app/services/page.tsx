import { Nav } from "@/components/nav";
import { DeliveryMap } from "@/components/delivery-map";
import { MotionReveal } from "@/components/motion-reveal";
import Link from "next/link";

const services = [
  {
    title: "AI Assistant Automation Workflows",
    emoji: "⚡",
    body: "We automate intake, follow-up, internal knowledge retrieval, and repetitive operational tasks with AI assistants that actually fit your team."
  },
  {
    title: "Custom AI App Builds",
    emoji: "🧠",
    body: "Chat interfaces, copilots, internal tools, and client-facing products designed with your data, your brand, and your security in mind."
  },
  {
    title: "SSAG Calculator",
    emoji: "⚖️",
    body: "A focused legal-tech workflow for calculating spousal support under the SSAG model with cleaner intake, repeatable logic, and faster case handling."
  },
  {
    title: "Vibe Code Cleanup",
    emoji: "🛠️",
    body: "We refactor brittle scripts and half-finished projects into clean, documented foundations you can build on."
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
