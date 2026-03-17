"use client";

import { createElement, ReactNode, useEffect, useRef, useState } from "react";

type MotionRevealProps = {
  as?: string;
  children: ReactNode;
  className?: string;
  delayMs?: number;
  variant?: "up" | "soft";
  [key: string]: unknown;
};

export function MotionReveal({
  as: Tag = "div",
  children,
  className,
  delayMs = 0,
  variant = "up",
  ...rest
}: MotionRevealProps) {
  const ref = useRef<Element | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return createElement(
    Tag,
    {
      ref,
      className: `${variant === "soft" ? "motion-soft" : "motion-up"} ${visible ? "is-visible" : ""} ${className ?? ""}`,
      style: { transitionDelay: `${delayMs}ms` },
      ...rest,
    },
    children
  );
}
