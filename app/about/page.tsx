import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";

export default function AboutPage() {
  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-20">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">— Who we are</MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl sm:text-6xl tracking-tight text-black" delayMs={80}>
          Built in Alberta. Built for Alberta.
        </MotionReveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <MotionReveal className="space-y-6 text-sm text-muted" delayMs={140}>
            <p className="text-base text-gray-700">
              AiAlberta is a young, focused team of verified computer science graduates and AI-verified architects.
              We live here, work here, and build for the realities of Alberta businesses, not generic playbooks.
            </p>
            <p>
              We speak Ai languages: clear, non-jargony explanations for owners and operators, and
              deep technical detail for developers and technical teams. Everyone in the room understands
              what we&apos;re building and why.
            </p>
            <p>
              Every project we take on starts with one question: <span className="text-black font-semibold">
              what does &ldquo;no one left behind&rdquo; look like for your team?
              </span> From there we design the smallest, clearest first win — usually something we
              can ship in weeks, not months.
            </p>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-black">
              Mission: No one left behind.
            </p>
          </MotionReveal>
          <MotionReveal className="relative h-64 overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-black/10 via-black/5 to-transparent" delayMs={220} variant="soft">
            <div className="absolute inset-6 grid grid-cols-3 gap-3 opacity-70">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-black/10 bg-black/5" />
              ))}
            </div>
            <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-2 text-xs text-black backdrop-blur">
              Local, certified, affordable, community-first.
            </div>
          </MotionReveal>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { stat: "9+", label: "Projects delivered in Alberta" },
            { stat: "80%", label: "Average cost reduction for clients" },
            { stat: "2×", label: "Featured in Globe and Mail" }
          ].map((item, index) => (
            <MotionReveal key={item.stat} className="rounded-3xl border border-black/10 bg-black/5 p-6" delayMs={300 + index * 90} variant="soft">
              <p className="font-display text-4xl text-black">{item.stat}</p>
              <p className="mt-2 text-sm text-muted">{item.label}</p>
            </MotionReveal>
          ))}
        </div>
      </div>
    </main>
  );
}
