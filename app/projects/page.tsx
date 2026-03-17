import { Nav } from "@/components/nav";
import { MotionReveal } from "@/components/motion-reveal";
import Link from "next/link";

const projects = [
  {
    title: "Parking Company System",
    tag: "Enterprise Automation",
    body: "Full parking company operating system with patrol enforcement workflows, dispatch visibility, reporting, and back-office automation designed for enterprise-scale operations."
  },
  {
    title: "SSAG Calculator",
    tag: "Legal Tech Tool",
    body: "A spousal support advisory guidelines calculator that streamlines case intake, performs support calculations, and gives users a cleaner decision-support workflow."
  },
  {
    title: "AI Assistant Workflows",
    tag: "Automation Workflow",
    body: "Automated AI assistant workflows for intake, internal knowledge retrieval, document handling, and operational follow-through across service teams."
  }
];

const mediaMentions = [
  {
    publication: "The Globe and Mail",
    title: "Vibe Coding: How AI Tools Are Changing Software Development",
    href: "https://www.theglobeandmail.com/business/article-vibe-coding-ai-tools-software-app-development/"
  },
  {
    publication: "The Globe and Mail",
    title: "Business Brief: We Tried Vibe Coding With AI",
    href: "https://www.theglobeandmail.com/business/article-business-brief-we-tried-vibe-coding-with-ai/"
  }
];

export default function ProjectsPage() {
  return (
    <main className="bg-white text-black">
      <Nav />
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-20">
        <MotionReveal as="p" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">— Delivered in Alberta</MotionReveal>
        <MotionReveal as="h1" className="mt-4 font-display text-4xl sm:text-6xl tracking-tight text-black" delayMs={80}>
          9+ projects. Real results.
        </MotionReveal>
        <MotionReveal as="p" className="mt-4 max-w-xl text-sm text-muted" delayMs={140}>
          Alberta teams using AI to answer real questions, remove manual work, and see their operations
          clearly for the first time.
        </MotionReveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {projects.map((project, i) => (
            <MotionReveal
              key={project.title}
              className="relative overflow-hidden rounded-3xl border border-black/10 bg-black/5 p-6"
              delayMs={180 + i * 90}
              variant="soft"
            >
              <div className="pointer-events-none absolute -right-4 -top-6 text-8xl font-display text-black/5">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="relative z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                {project.tag}
              </p>
              <h3 className="relative z-10 mt-2 font-display text-2xl tracking-tight text-black">
                {project.title}
              </h3>
              <p className="relative z-10 mt-4 text-sm text-muted">{project.body}</p>
            </MotionReveal>
          ))}
        </div>

        <MotionReveal className="mt-12 rounded-[32px] border border-black/10 bg-[#f7f4ef] p-6" delayMs={420}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Media</p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-black">
                Mentioned in The Globe and Mail
              </h2>
            </div>
            <p className="max-w-md text-sm text-muted">
              Coverage around vibe coding, AI tooling, and the broader shift in how modern software gets built.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {mediaMentions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-3xl border border-black/10 bg-white px-5 py-4 transition-colors hover:bg-black hover:text-white"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted hover:text-inherit">
                  {item.publication}
                </p>
                <p className="mt-2 text-base text-black transition-colors hover:text-white">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        </MotionReveal>
      </div>
    </main>
  );
}
