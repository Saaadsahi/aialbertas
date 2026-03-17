import Link from "next/link";
import { headers } from "next/headers";
import { getSessionUser } from "@/lib/auth/admin";
import { createOptionalServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function Nav() {
  const [user, headersList] = await Promise.all([
    getSessionUser(),
    headers(),
  ]);

  const pathname = headersList.get("x-pathname") ?? "/";
  const formattedName = formatDisplayName(user?.full_name ?? user?.email?.split("@")[0] ?? null);
  const firstName = formattedName?.split(" ")[0] ?? null;

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-black/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-2xl tracking-[0.2em] uppercase text-black">
          AiAlberta
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <Link href="/" className="hover:text-black">Home</Link>
          <Link href="/services" className="hover:text-black">Services</Link>
          <Link href="/projects" className="hover:text-black">Projects</Link>
          <Link href="/community" className="hover:text-black">Community</Link>
          <Link href="/about" className="hover:text-black">About</Link>
          <Link href="/contact" className="hover:text-black">Contact</Link>
        </nav>
        <div className="flex items-center gap-3 text-xs">
          {user ? (
            <>
              <span className="hidden text-xs text-muted sm:inline">{firstName}</span>
              {user.role !== "admin" && (
                <Link
                  href="/dashboard"
                  className="rounded-full border border-black/40 px-4 py-1.5 text-black hover:bg-black hover:text-white"
                >
                  Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex rounded-full bg-red-600 px-4 py-1.5 text-white hover:bg-red-700"
                >
                  Admin Panel
                </Link>
              )}
              <form
                action={async () => {
                  "use server";
                  const client = await createOptionalServerSupabaseClient();
                  await client?.auth.signOut();
                  redirect("/");
                }}
              >
                <button
                  type="submit"
                  className="rounded-full bg-black px-4 py-1.5 text-white hover:bg-gray-800"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="rounded-full border border-black/40 px-4 py-1.5 text-black hover:bg-black hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/contact"
                className="cta-fireworks rounded-full bg-black px-4 py-1.5 text-white hover:bg-gray-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function formatDisplayName(name: string | null) {
  if (!name) return null;

  return name
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
