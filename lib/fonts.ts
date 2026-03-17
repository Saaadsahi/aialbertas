import localFont from "next/font/local";

export const displayFont = localFont({
  src: "../public/fonts/DMSans-Variable.ttf",
  variable: "--font-display"
});

export const sansFont = localFont({
  src: "../public/fonts/DMSans-Variable.ttf",
  variable: "--font-sans"
});

export const monoFont = localFont({
  src: "../public/fonts/DMMono-Regular.ttf",
  variable: "--font-mono"
});
