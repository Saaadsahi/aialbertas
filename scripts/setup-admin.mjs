import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const email = "saadullahsahi2@gmail.com";
const password = "123123";

async function getExistingUserByEmail(targetEmail) {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw error;
  }

  return data.users.find((user) => user.email?.toLowerCase() === targetEmail.toLowerCase()) ?? null;
}

async function main() {
  console.log("Ensuring admin user exists...");

  let user = await getExistingUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error || !data.user) {
      console.error("Failed to create admin user:", error?.message ?? "Unknown error");
      process.exit(1);
    }

    user = data.user;
    console.log("Created admin user:", user.id);
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      console.error("Failed to update admin user:", JSON.stringify(error));
      process.exit(1);
    }

    console.log("Updated existing admin user:", user.id);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email,
    full_name: "",
    role: "admin"
  });

  if (profileError) {
    console.error("Failed to upsert admin profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin account is ready:");
  console.log(`  email: ${email}`);
  console.log(`  password: ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
