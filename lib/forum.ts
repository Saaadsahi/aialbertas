export function containsForumLink(value: string) {
  return /(https?:\/\/|www\.|[a-z0-9-]+\.(com|ca|org|net|io|co|app|dev|ai|gg|ly|me|edu)\b)/i.test(value);
}

export function formatForumName(name: string | null | undefined, fallback = "Member") {
  const clean = (name ?? "").trim();

  if (!clean) {
    return fallback;
  }

  return clean
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
