## AiAlberta

Full-stack web application for AiAlberta — "911 for your tech needs." Built with **Next.js 14 (App Router)**, **Supabase (Auth + Postgres)**, **Tailwind CSS**, **Stripe**, and **shadcn/ui**.

### Setup

1. **Create the project (if starting fresh)**

   ```bash
   npx create-next-app@latest aialberta --typescript --tailwind --app
   cd aialberta
   ```

2. **Install dependencies**

   ```bash
   npm install @supabase/ssr @supabase/supabase-js stripe @stripe/stripe-js \
     class-variance-authority tailwind-merge lucide-react \
     @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label \
     @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-slot
   ```

3. **Initialize shadcn/ui**

   ```bash
   npx shadcn-ui@latest init
   ```

4. **Create a Supabase project**

   - Go to `https://supabase.com`
   - Create a new project
   - Copy the **Project URL**, **anon key**, and **service role key**

5. **Configure environment variables**

   Create `.env.local` and add:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_signing_secret
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

6. **Run the SQL schema in Supabase**

   In the **SQL Editor**, run:

   ```sql
   -- Users table (extends Supabase auth.users)
   create table if not exists public.profiles (
     id uuid references auth.users on delete cascade primary key,
     email text unique not null,
     full_name text,
     avatar_url text,
     role text default 'user' check (role in ('user', 'admin')),
     created_at timestamp with time zone default now()
   );

   -- Service orders
   create table if not exists public.orders (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references public.profiles(id) on delete cascade,
     service_type text not null check (service_type in (
       'Automation Workflow',
       'Custom AI App',
       'AI Architecture',
       'Vibe Code Cleanup',
       'General Inquiry'
     )),
     description text,
     status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
     amount_paid numeric(10,2) default 0,
     stripe_payment_id text,
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );

   -- Community forum posts
   create table if not exists public.forum_posts (
     id uuid default gen_random_uuid() primary key,
     user_id uuid references public.profiles(id) on delete cascade,
     title text not null,
     body text not null,
     category text default 'general',
     upvotes integer default 0,
     pinned boolean default false,
     created_at timestamp with time zone default now()
   );

   -- Forum comments
   create table if not exists public.forum_comments (
     id uuid default gen_random_uuid() primary key,
     post_id uuid references public.forum_posts(id) on delete cascade,
     user_id uuid references public.profiles(id) on delete cascade,
     body text not null,
     created_at timestamp with time zone default now()
   );

   -- Contact / inquiry submissions
   create table if not exists public.contact_submissions (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     email text not null,
     service_type text,
     message text not null,
     read boolean default false,
     created_at timestamp with time zone default now()
   );
   ```

7. **Enable Row Level Security (RLS)** and policies

   Configure RLS so that:

   - **profiles**: users can read/update their own row only; admins can read all
   - **orders**: users can read their own orders; admins can read/update all
   - **forum_posts / forum_comments**: public read; authenticated write; owner or admin can delete
   - **contact_submissions**: public insert; admin read only

8. **Reset the database and bootstrap the admin**

   - Delete your old public tables in Supabase if needed
   - In the Supabase SQL Editor, run `supabase/reset.sql`
   - Then run:

   ```bash
   npm run setup:admin
   ```

   This creates or repairs the fixed admin account:

   ```text
   email: saadullahsahi@gmail.com
   password: admin123123
   ```

9. **Run the dev server**

   ```bash
   npm run dev
   ```

### Routes

- `/` — Public marketing site (single-page sections: Home, Services, Projects, Community, About, Contact)
- `/login`, `/signup` — Supabase Auth (email/password)
- `/dashboard` — Authenticated user dashboard (overview, orders, forum activity, account settings)
- `/admin` — Protected admin panel (users, orders, contact submissions, forum moderation)
- `/forum`, `/forum/[id]` — Community forum
- `/order` — Service order form backed by `orders` table
