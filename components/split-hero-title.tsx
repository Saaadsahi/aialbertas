"use client";

type SplitHeroTitleProps = {
  lines: string[];
  className?: string;
};

export function SplitHeroTitle({ lines, className }: SplitHeroTitleProps) {
  return (
    <h1 className={className}>
      {lines.map((line, lineIndex) => {
        const words = splitWords(line);

        return (
          <span key={`${line}-${lineIndex}`} className="block">
            {words.map((word, wordIndex) => (
              <span
                key={`${word}-${lineIndex}-${wordIndex}`}
                data-line={lineIndex}
                data-word={wordIndex}
                className="inline-block overflow-hidden align-top"
              >
                <span
                  className="hero-word-reveal inline-block"
                  style={{ animationDelay: `${lineIndex * 140 + wordIndex * 90}ms` }}
                >
                  {word}
                </span>
                {wordIndex < words.length - 1 ? " " : ""}
              </span>
            ))}
          </span>
        );
      })}
    </h1>
  );
}

function splitWords(value: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
    return Array.from(segmenter.segment(value))
      .filter((segment) => segment.isWordLike)
      .map((segment) => segment.segment);
  }

  return value.split(/\s+/).filter(Boolean);
}
