--------------------------------------------------
-- FULL RESET — run this in Supabase SQL Editor
-- Project ref: cvzdxykvkklxgcjaqdlm  Schema: public
--------------------------------------------------

-- Drop tables in dependency order
drop table if exists public.refunds cascade;
drop table if exists public.forum_comments cascade;
drop table if exists public.forum_posts cascade;
drop table if exists public.coffee_chats cascade;
drop table if exists public.payments cascade;
drop table if exists public.admins cascade;
drop table if exists public.profiles cascade;

-- Drop old functions/triggers cleanly
drop trigger if exists on_auth_user_created  on auth.users;
drop trigger if exists on_auth_user_updated  on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.handle_auth_user_updated();
drop function if exists public.is_admin(uuid);

--------------------------------------------------
-- PROFILES
--------------------------------------------------

create table public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text        not null default 'user',
  created_at timestamptz default now()
);

--------------------------------------------------
-- PAYMENTS
--------------------------------------------------

create table public.payments (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        references public.profiles(id) on delete cascade,
  stripe_payment_intent text,
  stripe_customer_id    text,
  amount                integer     default 0,
  currency              text        default 'cad',
  payment_status        text        default 'pending',
  refund_status         text        default 'none',
  created_at            timestamptz default now()
);

--------------------------------------------------
-- REFUNDS
--------------------------------------------------

create table public.refunds (
  id           uuid        primary key default gen_random_uuid(),
  payment_id   uuid        references public.payments(id) on delete cascade,
  processed_by uuid        references public.profiles(id),
  amount       integer,
  reason       text,
  created_at   timestamptz default now()
);

--------------------------------------------------
-- COFFEE CHATS
--------------------------------------------------

create table public.coffee_chats (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  full_name    text,
  email        text,
  coffee_pick  text        not null check (coffee_pick in ('coffee_on_me', 'coffee_on_you')),
  created_at   timestamptz default now()
);

--------------------------------------------------
-- FORUM POSTS
--------------------------------------------------

create table public.forum_posts (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  full_name    text,
  subject      text        not null,
  body         text        not null,
  created_at   timestamptz default now()
);

--------------------------------------------------
-- FORUM COMMENTS
--------------------------------------------------

create table public.forum_comments (
  id           uuid        primary key default gen_random_uuid(),
  post_id      uuid        not null references public.forum_posts(id) on delete cascade,
  user_id      uuid        not null references public.profiles(id) on delete cascade,
  full_name    text,
  body         text        not null,
  created_at   timestamptz default now()
);

--------------------------------------------------
-- TRIGGER 1: create profile row when user signs up
--------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

--------------------------------------------------
-- TRIGGER 2: sync email + full_name when auth user is updated
--------------------------------------------------

create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email     = new.email,
    full_name = coalesce(
                  nullif(new.raw_user_meta_data ->> 'full_name', ''),
                  profiles.full_name
                )
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_updated
after update on auth.users
for each row execute procedure public.handle_auth_user_updated();

--------------------------------------------------
-- is_admin() — checks profiles.role
--------------------------------------------------

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

--------------------------------------------------
-- ENABLE RLS
--------------------------------------------------

alter table public.profiles enable row level security;
alter table public.payments enable row level security;
alter table public.refunds  enable row level security;
alter table public.coffee_chats enable row level security;
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;

--------------------------------------------------
-- PROFILES POLICIES
--------------------------------------------------

create policy "users_view_own_profile"
on public.profiles for select
using (auth.uid() = id);

create policy "users_update_own_profile"
on public.profiles for update
using (auth.uid() = id);

create policy "admins_full_profiles"
on public.profiles for all
using (public.is_admin(auth.uid()));

--------------------------------------------------
-- PAYMENTS POLICIES
--------------------------------------------------

create policy "users_view_their_payments"
on public.payments for select
using (auth.uid() = user_id);

create policy "users_create_payment"
on public.payments for insert
with check (auth.uid() = user_id);

create policy "admins_manage_payments"
on public.payments for all
using (public.is_admin(auth.uid()));

--------------------------------------------------
-- REFUNDS POLICIES
--------------------------------------------------

create policy "admins_manage_refunds"
on public.refunds for all
using (public.is_admin(auth.uid()));

--------------------------------------------------
-- COFFEE CHATS POLICIES
--------------------------------------------------

create policy "users_create_own_coffee_chat"
on public.coffee_chats for insert
with check (auth.uid() = user_id);

create policy "users_view_own_coffee_chats"
on public.coffee_chats for select
using (auth.uid() = user_id);

create policy "admins_manage_coffee_chats"
on public.coffee_chats for all
using (public.is_admin(auth.uid()));

--------------------------------------------------
-- FORUM POSTS POLICIES
--------------------------------------------------

create policy "users_view_forum_posts"
on public.forum_posts for select
using (true);

create policy "users_create_own_forum_posts"
on public.forum_posts for insert
with check (auth.uid() = user_id);

create policy "admins_manage_forum_posts"
on public.forum_posts for all
using (public.is_admin(auth.uid()));

--------------------------------------------------
-- FORUM COMMENTS POLICIES
--------------------------------------------------

create policy "users_view_forum_comments"
on public.forum_comments for select
using (true);

create policy "users_create_own_forum_comments"
on public.forum_comments for insert
with check (auth.uid() = user_id);

create policy "admins_manage_forum_comments"
on public.forum_comments for all
using (public.is_admin(auth.uid()));

--------------------------------------------------
-- GRANT ADMIN after running this script:
--   update public.profiles set role = 'admin' where email = 'your@email.com';
--------------------------------------------------
