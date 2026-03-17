import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/config";

export async function createServerSupabaseClient() {
  const env = getSupabaseEnv();

  if (!env) {
    throw new Error("Missing Supabase environment variables");
  }

  return createConfiguredServerSupabaseClient(env.url, env.anonKey);
}

export async function createOptionalServerSupabaseClient() {
  const env = getSupabaseEnv();

  if (!env) {
    return null;
  }

  return createConfiguredServerSupabaseClient(env.url, env.anonKey);
}

async function createConfiguredServerSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string
) {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // ignore in server components; middleware will handle refresh
        }
      }
    }
  });
}
