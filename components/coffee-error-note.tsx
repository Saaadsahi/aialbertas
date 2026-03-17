"use client";

import { useEffect, useState } from "react";

export function CoffeeErrorNote() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      Can&apos;t accept this coffee request.
    </p>
  );
}
