import { Nav } from "@/components/nav";
import { CinematicCrawlPlayer } from "@/components/cinematic-crawl-player";
import { MotionReveal } from "@/components/motion-reveal";

const transmissionStory = `I did not wake up one day and decide to become the guy who fixes things. It just happened slowly, like small moments stacking on top of each other.

At first it was nothing serious. A friend messaged me saying his website was not loading. Another one could not log into his account. Someone else said their system worked yesterday but today everything was broken. I did not even know all the answers, but I always said the same thing, let me check.

I would sit there, staring at the screen, reading errors that made no sense. Lines of code, random numbers, failed requests. It felt like the system was speaking another language. But I stayed. I kept clicking, testing, searching, trying again. And then suddenly, something would work.

That moment felt different. Quiet, but powerful.

Over time, more people started coming to me. Not because I was the best, but because I did not give up. People had problems, real ones. A business that could not take payments. A website that crashed during a launch. A tool that was supposed to save time but instead wasted hours.

To them it was stress. To me it was a puzzle.

I started seeing patterns. Most things were not actually broken forever. They were just misunderstood. A wrong key. A missing connection. One small mistake hidden inside something big.

So I kept building. Small projects turned into bigger ones. I started working with AI, automation, databases, full systems from start to end. Sometimes I created things that worked perfectly. Sometimes I created things that completely failed.

Those failures taught me the most.

Late nights became normal. Sitting alone with a screen, trying to fix something no one else could see. It felt like being inside the system itself, moving through it, understanding it piece by piece.

And then came the moments I will always remember.

When someone said, it works now.

When a business started running smoothly again.

When something that was broken, confusing, stressful suddenly became simple.

That is when I realized what I actually do.

I do not just write code.

I help people move forward.

Behind every error message is a person trying to build something. Behind every broken system is someone who believed it would work.

And somehow, I became the person who steps in when it does not.

Not because I know everything.

But because I am willing to sit with the problem longer than anyone else.

I ask questions most people ignore.

I go deeper when others stop.

And I stay until it works.

Even now, every time I open my laptop, I know something will go wrong. Something always does. But instead of seeing it as a problem, I see it as the beginning of a story.

A system breaks.

A question appears.

And I start again.

Trying to understand.

Trying to fix.

Trying to make it work.

Because at the end of it all, that is who I am.

The guy who shows up when things stop working

and leaves only when they do.

-------THE END-----------------------------`;

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

        <MotionReveal className="mt-16" delayMs={380}>
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Ai Alberta Transmission</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight text-black sm:text-5xl">
              The Guy Who Fixed Things
            </h2>
          </div>
          <CinematicCrawlPlayer
            title="Ai Alberta Transmission"
            episode="Episode 1"
            body={transmissionStory}
            duration={240}
            tilt={22}
            fontSize={28}
            showStars
            loopDelayMs={1000}
            className="min-h-[38rem]"
          />
        </MotionReveal>
      </div>
    </main>
  );
}
