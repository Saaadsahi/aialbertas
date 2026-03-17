import Link from "next/link";

const workflow = [
  {
    step: "01",
    title: "Signal",
    body: "You bring a stuck process, messy workflow, or idea that needs shape.",
    tags: ["Audit the bottleneck", "Clarify the win"],
  },
  {
    step: "02",
    title: "Design",
    body: "We map the smallest practical AI system that solves the problem cleanly.",
    tags: ["Map data + tools", "Keep scope tight"],
  },
  {
    step: "03",
    title: "Ship",
    body: "Automation, app, or architecture goes live with clear ownership and cost control.",
    tags: ["Launch with confidence", "Measure savings"],
  },
];

export function DeliveryMap({ showCta = false }: { showCta?: boolean }) {
  return (
    <div className="rounded-[36px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,245,242,0.92))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.08)] sm:p-6">
      <div className="hero-panel-rise flex items-center justify-between rounded-2xl border border-black/10 bg-white/80 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            Delivery map
          </p>
          <p className="mt-1 text-sm text-black">
            From first signal to shipped system.
          </p>
        </div>
        <div className="rounded-full border border-black/10 bg-black px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white">
          3-step
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {workflow.map((item, index) => (
          <div
            key={item.step}
            className="hero-panel-rise rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_12px_32px_rgba(0,0,0,0.04)]"
            style={{ animationDelay: `${120 + index * 110}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 min-w-11 items-center justify-center rounded-full bg-black px-3 text-[11px] font-mono uppercase tracking-[0.15em] text-white">
                {item.step}
              </div>
              <div>
                <p className="font-display text-2xl tracking-tight text-black">{item.title}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                  Step {index + 1}
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-sm leading-6 text-muted">{item.body}</p>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-black/5 px-3 py-1 text-[11px] text-black">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="hero-panel-rise rounded-[28px] border border-black/10 bg-black p-5 text-white" style={{ animationDelay: "500ms" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
            Why it works
          </p>
          <p className="mt-3 text-sm leading-6 text-white/80">
            We don&apos;t sell a vague transformation story. We start with one painful workflow and
            build outward only when the economics are clear.
          </p>
        </div>
        <div className="hero-panel-rise rounded-[28px] border border-black/10 bg-[#f4ede4] p-5" style={{ animationDelay: "580ms" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/60">
            Typical first win
          </p>
          <p className="mt-3 text-sm leading-6 text-black/80">
            Intake automation, internal copilots, knowledge search, client ops cleanup.
          </p>
        </div>
      </div>

      {showCta && (
        <div className="hero-panel-rise mt-5 flex justify-end" style={{ animationDelay: "660ms" }}>
          <Link
            href="/order"
            className="rounded-full bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
          >
            Order a Service
          </Link>
        </div>
      )}
    </div>
  );
}
