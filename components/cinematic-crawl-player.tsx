"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CinematicCrawlPlayerProps = {
  title: string;
  episode: string;
  body: string;
  duration: number;
  tilt: number;
  fontSize: number;
  showStars: boolean;
  autoPlay?: boolean;
  loopDelayMs?: number;
  startPosition?: "bottom" | "top";
  className?: string;
};

export function CinematicCrawlPlayer({
  title,
  episode,
  body,
  duration,
  tilt,
  fontSize,
  showStars,
  autoPlay = true,
  loopDelayMs = 2000,
  startPosition = "bottom",
  className = ""
}: CinematicCrawlPlayerProps) {
  const [isPaused, setIsPaused] = useState(!autoPlay);
  const [replayKey, setReplayKey] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const starField = useMemo(() => {
    return Array.from({ length: 36 }, (_, index) => ({
      id: index,
      left: `${(index * 17) % 100}%`,
      top: `${(index * 29) % 100}%`,
      size: `${((index % 3) + 1) * 2}px`,
      delay: `${(index % 7) * 0.6}s`,
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  function clearRestartTimeout() {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }

  function restartCrawl() {
    clearRestartTimeout();
    setHasEnded(false);
    setReplayKey((current) => current + 1);
  }

  function scheduleRestart() {
    clearRestartTimeout();
    restartTimeoutRef.current = setTimeout(() => {
      setHasEnded(false);
      setReplayKey((current) => current + 1);
    }, loopDelayMs);
  }

  return (
    <section className={`crawl-stage rounded-[32px] border border-[#f4d05a]/20 bg-black ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 text-xs text-white/75">
        <div>
          <p className="font-mono uppercase tracking-[0.35em] text-[#f4d05a]">AI Alberta Transmission</p>
          <p className="mt-1 text-white/50">Cinematic crawl</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPaused((current) => {
                const next = !current;

                if (next) {
                  clearRestartTimeout();
                } else if (hasEnded) {
                  restartCrawl();
                }

                return next;
              });
            }}
            className="rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/85 hover:border-[#f4d05a] hover:text-[#f4d05a]"
          >
            {isPaused ? "Play" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => {
              restartCrawl();
              setIsPaused(false);
            }}
            className="rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-white/85 hover:border-[#f4d05a] hover:text-[#f4d05a]"
          >
            Replay
          </button>
        </div>
      </div>

      <div className="crawl-viewport">
        {showStars && (
          <div className="crawl-starfield" aria-hidden="true">
            {starField.map((star) => (
              <span
                key={star.id}
                className="crawl-star"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay
                }}
              />
            ))}
          </div>
        )}
        <div className="crawl-fade-top" aria-hidden="true" />
        <div className="crawl-fade-bottom" aria-hidden="true" />

        <div
          key={replayKey}
          className={`crawl-motion ${isPaused ? "is-paused" : ""} ${startPosition === "top" ? "start-top" : ""}`}
          style={
            {
              "--crawl-duration": `${duration}s`,
              "--crawl-tilt": `${tilt}deg`,
              "--crawl-font-size": `${fontSize}px`,
              "--crawl-start-translate": startPosition === "top" ? "18%" : "72%",
              "--crawl-end-translate": startPosition === "top" ? "-240%" : "-210%"
            } as React.CSSProperties
          }
        >
          <div className="crawl-perspective">
            <div
              className={`crawl-copy ${startPosition === "top" ? "start-top" : ""}`}
              onAnimationEnd={() => {
                setHasEnded(true);
                if (!isPaused) {
                  scheduleRestart();
                }
              }}
            >
              <p className="crawl-episode">{episode}</p>
              <h2 className="crawl-title">{title}</h2>
              {body.split(/\n+/).filter(Boolean).map((paragraph, index) => (
                <p key={`${paragraph}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
