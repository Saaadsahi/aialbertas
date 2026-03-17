import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Development Alberta | AIAlberta",
  description:
    "AI development in Alberta for automation tools, internal copilots, and custom AI software built around clear business outcomes.",
  alternates: {
    canonical: "https://aialbertas.com/ai-development-alberta"
  }
};

export default function AiDevelopmentAlbertaPage() {
  return (
    <main className="bg-white text-black">
      <Nav />
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-32">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          AI Development Alberta
        </MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl tracking-tight sm:text-6xl" delayMs={80}>
          Custom AI development for Alberta teams that need working systems
        </MotionReveal>
        <MotionReveal as="p" className="mt-6 max-w-3xl text-base leading-8 text-muted" delayMs={140}>
          AIAlberta designs and builds AI-powered apps, copilots, and internal tools for organizations that want usable software, not just AI branding.
        </MotionReveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            "AI-enabled web apps for internal operations",
            "Custom assistants trained on your process and data",
            "Architecture and implementation support for launch-ready systems"
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
          <h2 className="font-display text-3xl tracking-tight">Build the first version that proves the case</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
            Good AI development in Alberta starts with a scoped build that demonstrates value fast, then expands once the economics are clear.
          </p>
          <Link href="/contact" className="mt-6 inline-flex rounded-full bg-white px-6 py-2 text-sm text-black hover:bg-[#f3ede4]">
            Start the build conversation
          </Link>
        </MotionReveal>
      </section>
    </main>
  );
}
