import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Automation Alberta | AIAlberta",
  description:
    "AI automation services in Alberta for teams that want to reduce manual work, speed up operations, and ship practical AI systems.",
  alternates: {
    canonical: "https://aialbertas.com/ai-automation-alberta"
  }
};

export default function AiAutomationAlbertaPage() {
  return (
    <main className="bg-white text-black">
      <Nav />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-32">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          AI Automation Alberta
        </MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl tracking-tight sm:text-6xl" delayMs={80}>
          Practical AI automation for Alberta businesses
        </MotionReveal>
        <MotionReveal as="p" className="mt-6 max-w-3xl text-base leading-8 text-muted" delayMs={140}>
          AIAlberta helps teams in Alberta automate repetitive workflows, reduce operational drag, and launch internal tools that save time without forcing a full rebuild.
        </MotionReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            "Lead intake and routing automation",
            "Internal copilots for support and operations",
            "Reporting workflows that cut manual admin time"
          ].map((item, index) => (
            <MotionReveal
              key={item}
              className="rounded-[28px] border border-black/10 bg-[#faf8f3] p-6"
              delayMs={200 + index * 80}
              variant="soft"
            >
              <p className="text-sm leading-7 text-black/80">{item}</p>
            </MotionReveal>
          ))}
        </div>

        <MotionReveal className="mt-10 rounded-[32px] border border-black/10 bg-black p-8 text-white" delayMs={320}>
          <h2 className="font-display text-3xl tracking-tight">Start with one workflow that matters</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
            The strongest automation work starts small: one painful process, one clear owner, and one measurable improvement.
          </p>
          <Link href="/contact" className="mt-6 inline-flex rounded-full bg-white px-6 py-2 text-sm text-black hover:bg-[#f3ede4]">
            Talk to AIAlberta
          </Link>
        </MotionReveal>
      </section>
    </main>
  );
}
