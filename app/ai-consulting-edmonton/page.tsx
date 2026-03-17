import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Consulting Edmonton | AIAlberta",
  description:
    "AI consulting in Edmonton for teams that want clear AI strategy, sharper workflows, and implementation plans grounded in practical delivery.",
  alternates: {
    canonical: "https://aialbertas.com/ai-consulting-edmonton"
  }
};

export default function AiConsultingEdmontonPage() {
  return (
    <main className="bg-white text-black">
      <Nav />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-32">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          AI Consulting Edmonton
        </MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl tracking-tight sm:text-6xl" delayMs={80}>
          AI consulting in Edmonton that turns ideas into scoped delivery
        </MotionReveal>
        <MotionReveal as="p" className="mt-6 max-w-3xl text-base leading-8 text-muted" delayMs={140}>
          AIAlberta works with Edmonton founders, operators, and technical teams to identify high-leverage AI opportunities and convert them into small, realistic implementation plans.
        </MotionReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            "Workflow analysis for operations and internal teams",
            "AI roadmap design for product and service businesses",
            "Architecture guidance for AI-enabled apps and systems",
            "First-win planning that avoids bloated transformation projects"
          ].map((item, index) => (
            <MotionReveal
              key={item}
              className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
              delayMs={200 + index * 70}
              variant="soft"
            >
              <p className="text-sm leading-7 text-black/80">{item}</p>
            </MotionReveal>
          ))}
        </div>

        <MotionReveal className="mt-10 rounded-[32px] border border-black/10 bg-[#f4ede4] p-8" delayMs={320}>
          <h2 className="font-display text-3xl tracking-tight text-black">Clear next steps beat vague strategy</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/75">
            If you need AI consulting in Edmonton, the goal is not theory. The goal is one plan you can approve, own, and ship.
          </p>
          <Link href="/contact" className="mt-6 inline-flex rounded-full bg-black px-6 py-2 text-sm text-white hover:bg-gray-800">
            Book a conversation
          </Link>
        </MotionReveal>
      </section>
    </main>
  );
}
