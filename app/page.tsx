import { Nav } from "@/components/nav";
import { CoffeeErrorNote } from "@/components/coffee-error-note";
import { MotionReveal } from "@/components/motion-reveal";
import { SplitHeroTitle } from "@/components/split-hero-title";
import { getSessionUser } from "@/lib/auth/admin";
import type { Metadata } from "next";
import Link from "next/link";

const mediaMentions = [
  {
    title: "Vibe Coding: How AI Tools Are Changing Software Development",
    href: "https://www.theglobeandmail.com/business/article-vibe-coding-ai-tools-software-app-development/"
  },
  {
    title: "Business Brief: We Tried Vibe Coding With AI",
    href: "https://www.theglobeandmail.com/business/article-business-brief-we-tried-vibe-coding-with-ai/"
  }
];

const faqItems = [
  {
    question: "What does AIAlberta do?",
    answer:
      "AIAlberta fixes broken software, builds automated websites and workflows, generates AI-powered leads, integrates AI into business operations, and helps Alberta teams with almost any practical tech need."
  },
  {
    question: "What does AI consulting in Alberta look like?",
    answer:
      "AI consulting starts with identifying one practical workflow or product opportunity, then mapping the smallest system that can deliver measurable value."
  },
  {
    question: "What kind of AI development does AIAlberta provide?",
    answer:
      "AIAlberta builds AI apps, internal copilots, automation workflows, and technical architecture for Alberta businesses that want clear, shippable results."
  }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
};

export const metadata: Metadata = {
  alternates: {
    canonical: "https://aialbertas.com"
  }
};

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ coffeeError?: string }>;
}) {
  const params = await searchParams;
  const user = await getSessionUser();
  const formattedName = formatDisplayName(user?.full_name ?? user?.email?.split("@")[0] ?? null);
  const showCoffeeError = params.coffeeError === "1";

  return (
    <main className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Nav />
      <section className="relative overflow-hidden border-b border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fafaf8_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,0,0,0.06),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(193,154,107,0.16),_transparent_34%)]" />
        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-28 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)] lg:items-center">
          <div className="max-w-2xl">
            {formattedName && (
              <MotionReveal as="p" className="mb-5 text-xl tracking-tight text-black/75 sm:text-2xl" delayMs={40}>
                Hello, <span className="font-semibold text-black">{formattedName}</span>
              </MotionReveal>
            )}
            <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.3em] text-muted" delayMs={80}>
              Built in Alberta. Built for Alberta.
            </MotionReveal>
            <SplitHeroTitle
              className="mt-4 font-display text-[48px] leading-none tracking-tight text-black sm:text-[80px] lg:text-[112px]"
              lines={[
                "911 FOR",
                "YOUR TECH",
                "NEEDS.",
              ]}
            />
            <MotionReveal as="p" className="mt-6 max-w-xl text-sm text-muted sm:text-base" delayMs={220}>
              We fix broken workflows, rescue stuck projects, build automated systems,
              and help accelerate AI in Alberta. AIAlberta is here to make Alberta a sharper
              hub for practical AI, with one mission: no one left behind.
            </MotionReveal>
            <MotionReveal className="mt-8 flex flex-wrap gap-4 text-xs sm:text-sm" delayMs={280}>
              <Link
                href="/order"
                className="rounded-full bg-black px-6 py-2 text-white hover:bg-gray-800"
              >
                Order a Service
              </Link>
              <Link
                href="/community"
                className="rounded-full border border-black/40 px-6 py-2 text-black hover:bg-black hover:text-white"
              >
                Join the Community
              </Link>
            </MotionReveal>
            <MotionReveal className="mt-10 flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-black/70" delayMs={340}>
              <span className="rounded-full border border-black/10 bg-white/80 px-3 py-2">Automation</span>
              <span className="rounded-full border border-black/10 bg-white/80 px-3 py-2">AI Apps</span>
              <span className="rounded-full border border-black/10 bg-white/80 px-3 py-2">Architecture</span>
              <span className="rounded-full border border-black/10 bg-white/80 px-3 py-2">Cleanup</span>
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-red-700">No one left behind</span>
            </MotionReveal>
          </div>

          <div className="relative">
            <div className="rounded-[36px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,245,242,0.94))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:p-8">
              <div className="hero-panel-rise rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_12px_32px_rgba(0,0,0,0.04)]">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                  Coffee chat
                </p>
                <h2 className="mt-4 font-display text-4xl tracking-tight text-black sm:text-5xl">
                  Wanna talk tech,
                  <br />
                  Wanna build stuff?
                </h2>
                {showCoffeeError && <CoffeeErrorNote />}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/contact?coffee=on-me"
                    className="hero-panel-rise rounded-full border border-green-200 bg-green-50 px-6 py-2 text-sm text-green-800 hover:bg-green-100"
                    style={{ animationDelay: "120ms" }}
                  >
                    Coffee on me
                  </Link>
                  <Link
                    href="/?coffeeError=1"
                    className="hero-panel-rise rounded-full border border-red-200 bg-red-50 px-6 py-2 text-sm text-red-700 hover:bg-red-100"
                    style={{ animationDelay: "220ms" }}
                  >
                    Coffee on you
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="hero-panel-rise rounded-[28px] border border-black/10 bg-black p-5 text-white" style={{ animationDelay: "320ms" }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Alberta mission
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Built in Alberta. Built for Alberta. We show up when the workflow breaks, the stack gets messy, or the project stalls.
                  </p>
                </div>
                <div className="hero-panel-rise rounded-[28px] border border-black/10 bg-[#f4ede4] p-5" style={{ animationDelay: "420ms" }}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
                    Why people call us
                  </p>
                  <p className="mt-3 text-sm leading-6 text-black/80">
                    Broken software, messy automations, AI lead systems, site fixes, integrations, and any general tech need that has to work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MotionReveal as="section" className="bg-surface py-6 text-xs text-gray-700" delayMs={80} variant="soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted">9+</span>
            <span>Projects delivered in Alberta</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted">80%</span>
            <span>Average cost reduction</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted">2×</span>
            <span>Featured in Globe and Mail</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-muted">100%</span>
            <span>Certified AI architects</span>
          </div>
        </div>
      </MotionReveal>

      <MotionReveal as="section" className="border-t border-black/10 bg-white py-14" delayMs={100}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Media</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-black">
                Mentioned in The Globe and Mail
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted">
              Public coverage of AI-assisted software development and the changing way real work gets shipped.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {mediaMentions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-3xl border border-black/10 bg-[#f7f4ef] p-5 transition-colors hover:bg-black hover:text-white"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-inherit">
                  The Globe and Mail
                </p>
                <p className="mt-3 text-base text-black transition-colors hover:text-white">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </MotionReveal>

      <MotionReveal as="section" className="border-t border-black/10 bg-[#faf8f3] py-16" delayMs={120}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">FAQ</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-black sm:text-4xl">
              Answers for search, AI assistants, and real people
            </h2>
            <p className="mt-4 text-sm text-muted sm:text-base">
              Clear explanations help search engines and answer engines understand what AIAlberta does and who it serves.
            </p>
          </div>

          <div className="mt-8 grid gap-4">
            {faqItems.map((item, index) => (
              <MotionReveal
                key={item.question}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                delayMs={160 + index * 80}
                variant="soft"
              >
                <h3 className="font-display text-2xl tracking-tight text-black">{item.question}</h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
                  {item.answer}
                </p>
              </MotionReveal>
            ))}
          </div>
        </div>
      </MotionReveal>

      <footer className="border-t border-black/10 bg-white py-10 text-xs text-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="font-display text-lg tracking-[0.2em] uppercase text-black">AiAlberta</p>
            <p>© 2025 AiAlberta. Built in Alberta.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/services" className="hover:text-black">Services</Link>
            <Link href="/projects" className="hover:text-black">Projects</Link>
            <Link href="/community" className="hover:text-black">Community</Link>
            <Link href="/about" className="hover:text-black">About</Link>
            <Link href="/contact" className="hover:text-black">Contact</Link>
          </div>
          <p className="font-mono uppercase tracking-[0.25em] text-[10px]">No one left behind.</p>
        </div>
      </footer>
    </main>
  );
}

function formatDisplayName(name: string | null) {
  if (!name) return null;

  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
