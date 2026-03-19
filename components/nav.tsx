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
    <header className="fixed inset-x-0 top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
        <Link href="/" className="font-display text-xl tracking-[0.18em] text-black sm:text-2xl">
          Ai Alberta
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <Link href="/" className="hover:text-black">Home</Link>
          <Link href="/services" className="hover:text-black">Services</Link>
          <Link href="/projects" className="hover:text-black">Projects</Link>
          <Link href="/community" className="hover:text-black">Community</Link>
          <Link href="/about" className="hover:text-black">About</Link>
          <Link href="/contact" className="hover:text-black">Contact</Link>
        </nav>
        <div className="flex items-center gap-2 text-[11px] sm:gap-3 sm:text-xs">
          {user ? (
            <>
              <span className="hidden text-xs text-muted sm:inline">{firstName}</span>
              {user.role !== "admin" && (
                <Link
                  href="/dashboard"
                  className="rounded-full border border-black/40 px-3 py-1.5 text-black hover:bg-black hover:text-white sm:px-4"
                >
                  Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="inline-flex rounded-full bg-red-600 px-3 py-1.5 text-white hover:bg-red-700 sm:px-4"
                >
                  <span className="sm:hidden">Admin</span>
                  <span className="hidden sm:inline">Admin Panel</span>
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
                  className="rounded-full bg-black px-3 py-1.5 text-white hover:bg-gray-800 sm:px-4"
                >
                  <span className="sm:hidden">Out</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="rounded-full border border-black/40 px-3 py-1.5 text-black hover:bg-black hover:text-white sm:px-4"
              >
                <span className="sm:hidden">Sign in</span>
                <span className="hidden sm:inline">Sign In</span>
              </Link>
              <Link
                href="/contact"
                className="cta-fireworks rounded-full bg-black px-3 py-1.5 text-white hover:bg-gray-800 sm:px-4"
              >
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="border-t border-black/8 px-4 pb-3 pt-2 sm:hidden">
        <nav className="no-scrollbar flex gap-2 overflow-x-auto text-[11px] uppercase tracking-[0.16em] text-black/70">
          <MobileNavLink href="/">Home</MobileNavLink>
          <MobileNavLink href="/services">Services</MobileNavLink>
          <MobileNavLink href="/projects">Projects</MobileNavLink>
          <MobileNavLink href="/community">Community</MobileNavLink>
          <MobileNavLink href="/about">About</MobileNavLink>
          <MobileNavLink href="/contact">Contact</MobileNavLink>
        </nav>
      </div>
    </header>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-full border border-black/10 bg-black/[0.03] px-3 py-1.5 hover:border-black/30 hover:bg-black hover:text-white"
    >
      {children}
    </Link>
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
