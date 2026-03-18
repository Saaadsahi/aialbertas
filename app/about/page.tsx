import { Nav } from "@/components/nav";
import { CinematicCrawlPlayer } from "@/components/cinematic-crawl-player";
import { MotionReveal } from "@/components/motion-reveal";

const transmissionStory = `The Guy Who Fixed Things

Saad never planned to become the guy who fixes things. It just sort of happened.

One day someone couldn't log into their website. Another day someone's email wasn't working. Then someone's database broke at midnight. For some reason, Saad was always the person people called. Not because he had all the answers, but because he was curious enough to figure them out.

He grew up the kind of person who pressed every button just to see what would happen. Computers, websites, servers, code, AI tools - if something existed, Saad wanted to open it up and see how it worked. Sometimes things broke. Actually... a lot of things broke. But every broken thing became a puzzle.

Soon he realized something interesting: most people weren't bad with technology. They were just stuck.

A business owner couldn't connect their software. A startup founder couldn't automate their workflow. A website worked perfectly on a developer's laptop but completely died when it went live.

To Saad, these weren't disasters. They were mysteries.

He started building things. Small tools first. Then bigger ones. AI systems. Websites. Automation scripts. Databases that tracked everything from payments to users. Sometimes he would sit for hours staring at an error message that made absolutely no sense.

But when the system finally worked - when the site went live, when the automation ran perfectly, when someone messaged him saying "it works now!" - that was the moment he loved.

Because behind every broken system was a person just trying to make something work.

And somehow Saad always ended up being the guy who figured it out.

Not because he was the smartest person in the room.

But because he never stopped asking one simple question:

"Okay... but why is it broken?"

And once you ask that question long enough... eventually you find the answer.`;

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
            duration={90}
            tilt={22}
            fontSize={28}
            showStars
            className="min-h-[38rem]"
          />
        </MotionReveal>
      </div>
    </main>
  );
}
