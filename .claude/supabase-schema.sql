-- ============================================================================
-- Folio — Supabase schema: accounts + synced study progress + friends
-- ============================================================================
-- HOW TO APPLY
--   1. Create a project at https://supabase.com (free tier is plenty).
--   2. Dashboard → SQL Editor → New query → paste this WHOLE file → Run.
--   3. Dashboard → Authentication → Providers: enable Email (turn OFF
--      "Confirm email" while testing if you want instant signups).
--   4. Dashboard → Settings → API: copy the Project URL and the `anon` key.
--      Those two values go into the app (a small config at the top of app.js).
--      The anon key is DESIGNED to be public — security lives in the RLS
--      policies below, so never weaken them; never ship the service_role key.
--
-- Safe to re-run: statements are idempotent (if not exists / or replace /
-- drop policy if exists).
--
-- WHAT THE APP WILL CALL (plain fetch(), no SDK — zero-dependency rule):
--   sign up : POST {URL}/auth/v1/signup
--             body {email, password, data:{username, name}}          (data → raw_user_meta_data, used by the trigger below)
--   log in  : POST {URL}/auth/v1/token?grant_type=password  body {email, password}
--   then every REST call carries headers:
--             apikey: <anon key>
--             Authorization: Bearer <access_token from login>
--   pull    : GET   {URL}/rest/v1/progress?user_id=eq.<uid>&select=data,updated_at
--   push    : PATCH {URL}/rest/v1/progress?user_id=eq.<uid>  body {data:{...}}
--   find user: GET  {URL}/rest/v1/profiles?username=eq.<name>&select=id,username,name
--   request : POST  {URL}/rest/v1/friends  body {user_id:<me>, friend_id:<them>}
--   accept  : PATCH {URL}/rest/v1/friends?user_id=eq.<them>&friend_id=eq.<me>  body {status:"accepted"}
--   friend's badges: GET {URL}/rest/v1/progress?user_id=eq.<friend>&select=data
--             (allowed by RLS only once the friendship is accepted)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) PROFILES — one row per account (public identity: username, display name)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id       uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  name     text not null default 'Scholar',
  role     text not null default 'user' check (role in ('user','admin')),
  joined   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by signed-in users" on public.profiles;
create policy "profiles readable by signed-in users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- column-level guard: users may edit their username/name but NEVER their role
revoke update on table public.profiles from authenticated;
grant  update (username, name) on table public.profiles to authenticated;

-- (no insert policy: profiles are created by the auth trigger below)

-- ----------------------------------------------------------------------------
-- 2) PROGRESS — the app's whole synced state blob, one row per user.
--    `data` holds exactly the app's PROGRESS_FIELDS object:
--    { cards, suspended, daily, chrono, intro, streak, active, achievements, games }
--    Kept as one jsonb: the app is offline-first (localStorage stays the working
--    copy) and pushes the blob debounced; last-write-wins via updated_at.
-- ----------------------------------------------------------------------------
create table if not exists public.progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

drop policy if exists "own progress read + friends" on public.progress;
create policy "own progress read + friends"
  on public.progress for select to authenticated
  using (
    user_id = auth.uid()
    or exists (                       -- accepted friends may read (profile page shows a friend's badges/levels)
      select 1 from public.friends f
      where f.status = 'accepted'
        and ((f.user_id = auth.uid() and f.friend_id = progress.user_id)
          or (f.friend_id = auth.uid() and f.user_id  = progress.user_id))
    )
  );

drop policy if exists "own progress write" on public.progress;
create policy "own progress write"
  on public.progress for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "own progress insert" on public.progress;
create policy "own progress insert"
  on public.progress for insert to authenticated
  with check (user_id = auth.uid());

-- keep updated_at honest on every push
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch
  before update on public.progress
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- 3) FRIENDS — a request is a row (requester → recipient); accepting flips
--    status. One row per pair in either direction.
-- ----------------------------------------------------------------------------
create table if not exists public.friends (
  user_id    uuid not null references auth.users(id) on delete cascade,  -- requester
  friend_id  uuid not null references auth.users(id) on delete cascade,  -- recipient
  status     text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- forbid the reverse-direction duplicate (A→B and B→A)
create unique index if not exists friends_pair_uniq
  on public.friends (least(user_id, friend_id), greatest(user_id, friend_id));

alter table public.friends enable row level security;

drop policy if exists "see own friendships" on public.friends;
create policy "see own friendships"
  on public.friends for select to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

drop policy if exists "send requests as yourself" on public.friends;
create policy "send requests as yourself"
  on public.friends for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "recipient accepts" on public.friends;
create policy "recipient accepts"
  on public.friends for update to authenticated
  using (friend_id = auth.uid()) with check (status = 'accepted');

drop policy if exists "either side removes" on public.friends;
create policy "either side removes"
  on public.friends for delete to authenticated
  using (user_id = auth.uid() or friend_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 4) SIGNUP TRIGGER — auto-create the profile + empty progress row when an
--    auth user is created. Username comes from the signup call's data{}
--    (raw_user_meta_data); falls back to scholar_<id-prefix> if taken/invalid.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  begin
    insert into public.profiles (id, username, name)
    values (
      new.id,
      coalesce(lower(new.raw_user_meta_data->>'username'), 'scholar_' || substr(new.id::text, 1, 8)),
      coalesce(new.raw_user_meta_data->>'name', 'Scholar')
    );
  exception when unique_violation or check_violation then
    -- requested username taken or invalid → sign up anyway with a fallback handle (the app lets them rename later)
    insert into public.profiles (id, username, name)
    values (new.id, 'scholar_' || substr(new.id::text, 1, 8), coalesce(new.raw_user_meta_data->>'name', 'Scholar'))
    on conflict (id) do nothing;
  end;
  insert into public.progress (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
