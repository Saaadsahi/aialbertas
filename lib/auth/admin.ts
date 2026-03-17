import { redirect } from "next/navigation";
import { createServerSupabaseClient, createOptionalServerSupabaseClient } from "@/lib/supabase/server";

export async function requireAdminSession() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return { supabase, user };
}

export async function getSessionUser() {
  const supabase = await createOptionalServerSupabaseClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    full_name: profile?.full_name ?? null,
    role: ((profile?.role ?? "user") === "admin" ? "admin" : "user") as "admin" | "user",
  };
}
