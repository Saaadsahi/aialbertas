import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/config";

const PROTECTED_AUTH_ROUTES = ["/dashboard", "/order"];
const ADMIN_ROUTES = ["/admin"];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const env = getSupabaseEnv();
  if (!env) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options)
        );
      }
    }
  });

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isAuthed = !!user;

  const isProtectedAuthRoute = PROTECTED_AUTH_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedAuthRoute && !isAuthed) {
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    if (!isAuthed) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Block non-admins at the edge — don't let them reach the page at all
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/order",
    "/admin",
    "/admin/:path*"
  ]
};
