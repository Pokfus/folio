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
  avatar   text,               -- profile photo as a small data-URI (client resizes to 128px JPEG, ~6 KB)
  joined   timestamptz not null default now()
);
alter table public.profiles add column if not exists avatar text;   -- migration for databases created before avatars

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by signed-in users" on public.profiles;
create policy "profiles readable by signed-in users"
  on public.profiles for select to authenticated using (true);

drop policy if exists "own profile update" on public.profiles;
create policy "own profile update"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- column-level guard: users may edit their username/name/avatar but NEVER their role
revoke update on table public.profiles from authenticated;
grant  update (username, name, avatar) on table public.profiles to authenticated;

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

-- (the read policy for progress lives at the END of section 3 — it references the
--  friends table, which must exist first)

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

-- progress read policy — declared here (not in section 2) because it references
-- public.friends, which has to exist before Postgres will accept the policy
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

-- ----------------------------------------------------------------------------
-- 3b) CONTENT OVERRIDES — live editing. A single row (id=1) holding the admin
--     edit overlay (the same delta format as localStorage folio_admin_v1).
--     EVERYONE (anonymous visitors included) reads it at boot and applies it
--     over the shipped data files; only signed-in admins may write it.
--     After the overlay is baked into data.js/glossary.js and deployed, reset
--     data to '{}' (Table Editor) so a stale overlay can't shadow newer files.
-- ----------------------------------------------------------------------------
create table if not exists public.content_overrides (
  id         int primary key default 1,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint content_overrides_single_row check (id = 1)
);

alter table public.content_overrides enable row level security;

drop policy if exists "overrides are public" on public.content_overrides;
create policy "overrides are public"
  on public.content_overrides for select to anon, authenticated using (true);

drop policy if exists "admins publish overrides" on public.content_overrides;
create policy "admins publish overrides"
  on public.content_overrides for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.content_overrides (id) values (1) on conflict (id) do nothing;

drop trigger if exists content_overrides_touch on public.content_overrides;
create trigger content_overrides_touch
  before update on public.content_overrides
  for each row execute function public.touch_updated_at();

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

-- ----------------------------------------------------------------------------
-- 5) COMMUNITY DECKS — decks users write themselves and publish for others.
--
--    Phase 1 kept these purely local (IndexedDB + .folio-deck.json files).
--    Phase 2 adds publishing: a deck row plus its cards as ROWS, not one blob.
--    That split is deliberate — it is what lets a later paid tier gate the
--    non-demo cards in RLS (`is_demo or entitled`) rather than in the client,
--    where devtools would defeat it. price_cents / is_demo are carried now so
--    that phase needs no migration.
--
--    Cards published here are NOT fact-checked by Folio and never mix with the
--    curated content: the app keeps them in a separate store and keeps them out
--    of the daily games.
-- ----------------------------------------------------------------------------
create table if not exists public.user_decks (
  id           uuid primary key default gen_random_uuid(),
  owner        uuid not null references auth.users(id) on delete cascade,
  slug         text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,63}$'),
  title        text not null check (char_length(title) between 1 and 200),
  subtitle     text not null default '',
  description  text not null default '',
  author       text not null default '',
  language     text not null default 'en',
  tags         text[] not null default '{}',
  gloss_mode   text not null default 'site' check (gloss_mode in ('site','own','both')),
  status       text not null default 'published' check (status in ('draft','published','hidden','removed')),
  card_count   int  not null default 0,
  install_count int not null default 0,
  rating_avg   numeric(3,2) not null default 0,   -- phase 3
  rating_count int  not null default 0,           -- phase 3
  price_cents  int  not null default 0,           -- phase 5 (0 = free; everything is free today)
  version      int  not null default 1,           -- bumped on every publish; drives "update available"
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists user_decks_browse on public.user_decks (status, updated_at desc);
create index if not exists user_decks_owner  on public.user_decks (owner);

alter table public.user_decks enable row level security;

drop policy if exists "published decks are public" on public.user_decks;
create policy "published decks are public"
  on public.user_decks for select to anon, authenticated
  using (status = 'published' or owner = auth.uid()
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "publish your own decks" on public.user_decks;
create policy "publish your own decks"
  on public.user_decks for insert to authenticated with check (owner = auth.uid());

drop policy if exists "edit your own decks" on public.user_decks;
create policy "edit your own decks"
  on public.user_decks for update to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());

-- moderation: an admin may hide or restore any deck
drop policy if exists "admins moderate decks" on public.user_decks;
create policy "admins moderate decks"
  on public.user_decks for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "delete your own decks" on public.user_decks;
create policy "delete your own decks"
  on public.user_decks for delete to authenticated
  using (owner = auth.uid()
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop trigger if exists user_decks_touch on public.user_decks;
create trigger user_decks_touch before update on public.user_decks
  for each row execute function public.touch_updated_at();

-- ---- cards: one row per card, so a paid tier can gate them individually ----
create table if not exists public.user_cards (
  deck_id  uuid not null references public.user_decks(id) on delete cascade,
  id       text not null check (id ~ '^u_[a-z0-9]{4,16}_[0-9a-z]{1,8}$'),
  ord      int  not null default 0,
  is_demo  boolean not null default true,   -- phase 5: false = behind the paywall
  data     jsonb not null default '{}'::jsonb,
  primary key (deck_id, id)
);
create index if not exists user_cards_deck on public.user_cards (deck_id, ord);

alter table public.user_cards enable row level security;

-- THE paywall seam. Today every published card is readable because every deck is free and is_demo
-- defaults true; phase 5 flips non-demo cards to false and adds `or exists (entitlement)` here. Keep
-- this check in the database — a client-side filter is not a paywall.
drop policy if exists "cards of readable decks" on public.user_cards;
create policy "cards of readable decks"
  on public.user_cards for select to anon, authenticated
  using (exists (
    select 1 from public.user_decks d
    where d.id = user_cards.deck_id
      and (d.owner = auth.uid()
           or (d.status = 'published' and (is_demo or d.price_cents = 0))
           or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  ));

drop policy if exists "write cards of your own decks" on public.user_cards;
create policy "write cards of your own decks"
  on public.user_cards for all to authenticated
  using (exists (select 1 from public.user_decks d where d.id = user_cards.deck_id and d.owner = auth.uid()))
  with check (exists (select 1 from public.user_decks d where d.id = user_cards.deck_id and d.owner = auth.uid()));

-- ---- per-deck glossary (phase 4 edits it; the column exists so a deck file round-trips) ----
create table if not exists public.user_gloss (
  deck_id uuid not null references public.user_decks(id) on delete cascade,
  slug    text not null,
  data    jsonb not null default '{}'::jsonb,
  primary key (deck_id, slug)
);
alter table public.user_gloss enable row level security;

drop policy if exists "gloss of readable decks" on public.user_gloss;
create policy "gloss of readable decks"
  on public.user_gloss for select to anon, authenticated
  using (exists (select 1 from public.user_decks d where d.id = user_gloss.deck_id
                   and (d.status = 'published' or d.owner = auth.uid())));

drop policy if exists "write gloss of your own decks" on public.user_gloss;
create policy "write gloss of your own decks"
  on public.user_gloss for all to authenticated
  using (exists (select 1 from public.user_decks d where d.id = user_gloss.deck_id and d.owner = auth.uid()))
  with check (exists (select 1 from public.user_decks d where d.id = user_gloss.deck_id and d.owner = auth.uid()));

-- ---- installs: lets a signed-in learner's installed decks follow them between devices,
--      and gives install_count an honest source (one row per user per deck) ----
create table if not exists public.deck_installs (
  deck_id   uuid not null references public.user_decks(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  version   int  not null default 1,
  installed_at timestamptz not null default now(),
  primary key (deck_id, user_id)
);
alter table public.deck_installs enable row level security;

drop policy if exists "see your own installs" on public.deck_installs;
create policy "see your own installs"
  on public.deck_installs for select to authenticated using (user_id = auth.uid());

drop policy if exists "record your own installs" on public.deck_installs;
create policy "record your own installs"
  on public.deck_installs for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "update your own installs" on public.deck_installs;
create policy "update your own installs"
  on public.deck_installs for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "remove your own installs" on public.deck_installs;
create policy "remove your own installs"
  on public.deck_installs for delete to authenticated using (user_id = auth.uid());

-- keep user_decks.install_count honest (clients cannot write the column directly)
create or replace function public.sync_install_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform set_config('folio.sync', 'on', true);   -- transaction-local: tells the column guard this write is ours
  update public.user_decks d
     set install_count = (select count(*) from public.deck_installs i where i.deck_id = d.id)
   where d.id = coalesce(new.deck_id, old.deck_id);
  perform set_config('folio.sync', 'off', true);
  return coalesce(new, old);
end $$;

drop trigger if exists deck_installs_count on public.deck_installs;
create trigger deck_installs_count after insert or delete on public.deck_installs
  for each row execute function public.sync_install_count();

-- keep user_decks.card_count honest the same way
create or replace function public.sync_card_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform set_config('folio.sync', 'on', true);   -- transaction-local: tells the column guard this write is ours
  update public.user_decks d
     set card_count = (select count(*) from public.user_cards c where c.deck_id = d.id)
   where d.id = coalesce(new.deck_id, old.deck_id);
  perform set_config('folio.sync', 'off', true);
  return coalesce(new, old);
end $$;

drop trigger if exists user_cards_count on public.user_cards;
create trigger user_cards_count after insert or delete on public.user_cards
  for each row execute function public.sync_card_count();

-- ---- column guard ----
-- RLS decides WHICH ROWS you may write, never which COLUMNS. "edit your own decks" would therefore let an
-- owner PATCH their own install_count or card_count -- or, once phase 3 lands, award themselves a staff
-- pick and a five-star average. These columns are maintained by triggers or reserved for editors, so any
-- value a non-admin supplies is silently restored rather than rejected (a PostgREST error here would be a
-- worse experience than simply ignoring a field the client had no business sending).
create or replace function public.guard_user_deck_columns()
returns trigger language plpgsql security definer set search_path = public as $$
declare is_admin boolean;
begin
  -- our own maintenance triggers set this; without the exemption the guard would undo their writes
  if coalesce(current_setting('folio.sync', true), 'off') = 'on' then return new; end if;
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') into is_admin;
  if coalesce(is_admin, false) then return new; end if;
  if tg_op = 'INSERT' then
    new.owner         := auth.uid();
    new.card_count    := 0;
    new.install_count := 0;
    new.rating_avg    := 0;
    new.rating_count  := 0;
    new.created_at    := now();
  else
    new.owner         := old.owner;
    new.card_count    := old.card_count;
    new.install_count := old.install_count;
    new.rating_avg    := old.rating_avg;
    new.rating_count  := old.rating_count;
    new.created_at    := old.created_at;
  end if;
  return new;
end $$;

drop trigger if exists user_decks_guard on public.user_decks;
create trigger user_decks_guard before insert or update on public.user_decks
  for each row execute function public.guard_user_deck_columns();

-- ---- reports: how a reader flags a deck for the site owner ----
create table if not exists public.deck_reports (
  id         uuid primary key default gen_random_uuid(),
  deck_id    uuid not null references public.user_decks(id) on delete cascade,
  reporter   uuid references auth.users(id) on delete set null,
  reason     text not null check (reason in ('inaccurate','offensive','copyright','spam','other')),
  note       text not null default '',
  status     text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now()
);
alter table public.deck_reports enable row level security;

drop policy if exists "file a report" on public.deck_reports;
create policy "file a report"
  on public.deck_reports for insert to authenticated with check (reporter = auth.uid());

drop policy if exists "admins read reports" on public.deck_reports;
create policy "admins read reports"
  on public.deck_reports for select to authenticated
  using (reporter = auth.uid()
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "admins close reports" on public.deck_reports;
create policy "admins close reports"
  on public.deck_reports for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ----------------------------------------------------------------------------
-- 6) RATINGS (phase 3) — one row per user per deck, plus the denormalised
--    summary columns the browse list sorts and filters on.
--
--    Re-run safe, and additive to section 5: existing installs just gain the
--    new columns and the ratings table.
-- ----------------------------------------------------------------------------
create table if not exists public.deck_ratings (
  deck_id    uuid not null references public.user_decks(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  stars      int  not null check (stars between 1 and 5),
  body       text not null default '' check (char_length(body) <= 500),
  author     text not null default '',      -- display name copied at write time, so listing reviews needs no join
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (deck_id, user_id)
);
create index if not exists deck_ratings_deck on public.deck_ratings (deck_id, updated_at desc);

alter table public.deck_ratings enable row level security;

-- Reviews of a publicly readable deck are public: the whole point is to help a stranger judge it.
drop policy if exists "ratings of readable decks" on public.deck_ratings;
create policy "ratings of readable decks"
  on public.deck_ratings for select to anon, authenticated
  using (exists (select 1 from public.user_decks d where d.id = deck_ratings.deck_id
                   and (d.status = 'published' or d.owner = auth.uid())));

-- You may only write your own rating, only on a published deck, and NOT on your own deck.
drop policy if exists "rate as yourself" on public.deck_ratings;
create policy "rate as yourself"
  on public.deck_ratings for insert to authenticated
  with check (user_id = auth.uid()
              and exists (select 1 from public.user_decks d
                            where d.id = deck_ratings.deck_id and d.status = 'published' and d.owner <> auth.uid()));

drop policy if exists "change your own rating" on public.deck_ratings;
create policy "change your own rating"
  on public.deck_ratings for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "withdraw your own rating" on public.deck_ratings;
create policy "withdraw your own rating"
  on public.deck_ratings for delete to authenticated
  using (user_id = auth.uid());

drop trigger if exists deck_ratings_touch on public.deck_ratings;
create trigger deck_ratings_touch before update on public.deck_ratings
  for each row execute function public.touch_updated_at();

-- per-star counts, so the deck page can draw a distribution without an aggregate query
alter table public.user_decks add column if not exists rating_1 int not null default 0;
alter table public.user_decks add column if not exists rating_2 int not null default 0;
alter table public.user_decks add column if not exists rating_3 int not null default 0;
alter table public.user_decks add column if not exists rating_4 int not null default 0;
alter table public.user_decks add column if not exists rating_5 int not null default 0;
-- an editor's endorsement: the one strong quality signal on a page of unvetted content
alter table public.user_decks add column if not exists staff_pick boolean not null default false;
-- where a forked deck came from, as {slug, title, author}; shown as "based on ..." for attribution
alter table public.user_decks add column if not exists forked_from jsonb;

-- Ranking. A plain mean puts a single 5-star review above a deck with fifty 4.5s, so browse orders by a
-- Bayesian-adjusted score instead: pull each deck's average towards a prior until enough votes exist.
-- PRIOR_N = 10 votes, PRIOR_AVG = 3.5. A generated column may only read its own row, so the prior is a
-- constant rather than the live site mean — close enough, and it keeps the sort indexable.
alter table public.user_decks drop column if exists rank_score;
alter table public.user_decks add column rank_score numeric(6,4)
  generated always as (
    (rating_count::numeric / (rating_count + 10)) * rating_avg
    + (10::numeric / (rating_count + 10)) * 3.5
  ) stored;
create index if not exists user_decks_rank on public.user_decks (status, rank_score desc);
create index if not exists user_decks_pick on public.user_decks (status, staff_pick) where staff_pick;

-- keep every summary column honest; clients can never write them directly
create or replace function public.sync_deck_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare d uuid;
begin
  d := coalesce(new.deck_id, old.deck_id);
  perform set_config('folio.sync', 'on', true);   -- transaction-local: tells the column guard this write is ours
  update public.user_decks x set
    rating_count = (select count(*)             from public.deck_ratings r where r.deck_id = d),
    rating_avg   = (select coalesce(round(avg(r.stars)::numeric, 2), 0) from public.deck_ratings r where r.deck_id = d),
    rating_1     = (select count(*) from public.deck_ratings r where r.deck_id = d and r.stars = 1),
    rating_2     = (select count(*) from public.deck_ratings r where r.deck_id = d and r.stars = 2),
    rating_3     = (select count(*) from public.deck_ratings r where r.deck_id = d and r.stars = 3),
    rating_4     = (select count(*) from public.deck_ratings r where r.deck_id = d and r.stars = 4),
    rating_5     = (select count(*) from public.deck_ratings r where r.deck_id = d and r.stars = 5)
  where x.id = d;
  perform set_config('folio.sync', 'off', true);
  return coalesce(new, old);
end $$;

drop trigger if exists deck_ratings_sync on public.deck_ratings;
create trigger deck_ratings_sync after insert or update or delete on public.deck_ratings
  for each row execute function public.sync_deck_rating();

-- extend the column guard to the columns phase 3 adds. Without this an owner could PATCH staff_pick on
-- their own deck and manufacture an editorial endorsement.
create or replace function public.guard_user_deck_columns()
returns trigger language plpgsql security definer set search_path = public as $$
declare is_admin boolean;
begin
  if coalesce(current_setting('folio.sync', true), 'off') = 'on' then return new; end if;
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') into is_admin;
  if coalesce(is_admin, false) then return new; end if;
  if tg_op = 'INSERT' then
    new.owner := auth.uid();
    new.card_count := 0; new.install_count := 0;
    new.rating_avg := 0; new.rating_count := 0;
    new.rating_1 := 0; new.rating_2 := 0; new.rating_3 := 0; new.rating_4 := 0; new.rating_5 := 0;
    new.staff_pick := false;
    new.created_at := now();
  else
    new.owner := old.owner;
    new.card_count := old.card_count; new.install_count := old.install_count;
    new.rating_avg := old.rating_avg; new.rating_count := old.rating_count;
    new.rating_1 := old.rating_1; new.rating_2 := old.rating_2; new.rating_3 := old.rating_3;
    new.rating_4 := old.rating_4; new.rating_5 := old.rating_5;
    new.staff_pick := old.staff_pick;
    new.created_at := old.created_at;
  end if;
  return new;
end $$;

-- staff picks are an editorial act: only an admin may set the flag
drop policy if exists "admins set staff picks" on public.user_decks;
create policy "admins set staff picks"
  on public.user_decks for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ----------------------------------------------------------------------------
-- 7) FEEDBACK (beta) — messages readers send straight to the editors from the
--    About page, and the triage state behind Edit → Feedback.
--
--    Additive and re-run safe. Until this block has been run, every feedback
--    call 404s and the app says "Feedback isn't set up on this site yet."
--    rather than leaking PostgREST's error; nothing else breaks.
--
--    ANONYMOUS INSERTS ARE ALLOWED, deliberately. During the beta the whole
--    point is to hear from people who have not made an account, and a sign-in
--    wall is exactly the friction that stops a reader reporting a wrong date.
--    The cost is that the publishable key lets anyone POST here; the app's
--    only rate limit is a device-local cooldown, which is honest friction and
--    not security. If it is ever abused, narrow the insert policy below to
--    `to authenticated` — no application code has to change.
-- ----------------------------------------------------------------------------
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  author     uuid references auth.users(id) on delete set null,   -- null = sent signed out
  name       text not null default ''  check (char_length(name)  <= 80),
  email      text not null default ''  check (char_length(email) <= 160),   -- optional reply address
  kind       text not null default 'other' check (kind in ('bug','correction','suggestion','praise','other')),
  message    text not null check (char_length(message) between 1 and 4000),
  page       text not null default ''  check (char_length(page) <= 200),    -- the route they were on
  meta       jsonb not null default '{}'::jsonb,                            -- { lang, ua }
  status     text not null default 'new' check (status in ('new','seen','approved','done','discarded')),
  admin_note text not null default ''  check (char_length(admin_note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists feedback_triage on public.feedback (status, created_at desc);

alter table public.feedback enable row level security;

drop policy if exists "anyone may send feedback" on public.feedback;
create policy "anyone may send feedback"
  on public.feedback for insert to anon, authenticated
  with check (author is null or author = auth.uid());

-- Nobody reads the queue but the editors. A signed-in sender may see their own messages back, which is
-- what lets the app tell them their note is still on file; an anonymous one has no row to be found by.
drop policy if exists "admins read feedback" on public.feedback;
create policy "admins read feedback"
  on public.feedback for select to authenticated
  using (author = auth.uid()
         or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "admins triage feedback" on public.feedback;
create policy "admins triage feedback"
  on public.feedback for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "admins delete feedback" on public.feedback;
create policy "admins delete feedback"
  on public.feedback for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ---- column guard ----
-- Same reasoning as guard_user_deck_columns: RLS decides which ROWS you may write, never which COLUMNS.
-- Without this a sender could POST status='done' alongside their message and file it away before an
-- editor ever saw it, or plant an admin_note. A non-admin's triage columns are silently restored rather
-- than rejected, and a non-admin cannot alter a message once it has been sent.
create or replace function public.guard_feedback_columns()
returns trigger language plpgsql security definer set search_path = public as $$
declare is_admin boolean;
begin
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') into is_admin;
  if coalesce(is_admin, false) then return new; end if;
  if tg_op = 'INSERT' then
    new.author     := auth.uid();   -- null for an anonymous sender
    new.status     := 'new';
    new.admin_note := '';
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;
  return old;   -- a non-admin may not change a message once it is sent
end $$;

-- BEFORE-triggers fire in name order, so the guard runs before the touch and updated_at stays honest
drop trigger if exists feedback_guard on public.feedback;
create trigger feedback_guard before insert or update on public.feedback
  for each row execute function public.guard_feedback_columns();

drop trigger if exists feedback_touch on public.feedback;
create trigger feedback_touch before update on public.feedback
  for each row execute function public.touch_updated_at();


-- ============================================================
-- 8) CARD TYPES  (run once, on top of the phase-2 block)
--
-- A deck's own card types: the field names, the front and back templates and the CSS an author writes in the
-- Studio. They live on the DECK because the deck is the unit that travels — a template left behind would
-- leave an installed copy rendering its fields as raw prose.
--
-- Client-writable on purpose: this is the owner's content, like the title or the tags, so it is deliberately
-- NOT added to guard_user_deck_columns() (which exists for the columns the SERVER maintains). Everything in
-- it is re-sanitized on the client at ingest — uTypesSanitize in app.js — because the server copy is not
-- trusted just because it came from our own API.
--
-- Until this runs, publishing a deck that HAS custom types fails with a clear message and everything else
-- carries on: app.js sends the column only when the deck actually uses a type of its own.
-- ============================================================
alter table public.user_decks add column if not exists types jsonb not null default '{}'::jsonb;

-- ============================================================
-- 9) GLOSSARY OFF  (run once, on top of the phase-2 block)
-- ------------------------------------------------------------
-- A deck may now say it wants NO glossary at all (Aug 2026, on request), beside the three it already had:
-- Folio's terms, only its own, or its own layered over Folio's. It is for a deck whose vocabulary keeps
-- colliding with a glossary written about something else — every match is then a link telling the reader
-- something untrue about the sentence in front of them, and no per-term blocklist can fix that, because the
-- same key is right or wrong depending on the sentence.
--
-- The column already exists; only its CHECK has to learn the fourth value. Until this runs, a deck set to
-- "off" studies correctly on the device that wrote it and REFUSES TO PUBLISH — the insert fails the
-- constraint — so the site keeps working and the failure is loud rather than silent.
-- ============================================================
alter table public.user_decks drop constraint if exists user_decks_gloss_mode_check;
alter table public.user_decks add constraint user_decks_gloss_mode_check
  check (gloss_mode in ('site','own','both','off'));


-- ============================================================
-- 10) REVIEW LOG  (run once, on top of the phase-2 block)
--
-- One row per answer, for ever. `progress.data` already carries a rolling window of the same rows so that
-- Card info, the answer-buttons chart and a signed-out reader all work offline — but that blob is PATCHed
-- WHOLE on every save, so it cannot be where a reader's whole history lives. This table is.
--
-- WHY IT HAS TO BE COMPLETE. A card record keeps only its latest review, so nothing about a past one is
-- reconstructable later: every day it is not being written is detail no future release can recover. What
-- wants all of it is the FSRS optimiser, which fits a reader's own 21 parameters to their own review history
-- — with a truncated log it can only ever fit part of one.
--
-- APPEND-ONLY BY POLICY, not just by habit: there is no update policy at all, so a row cannot be edited
-- after the fact by anyone, the owner included. Deletes ARE allowed, because Settings → Reset progress says
-- it clears the study history and must be able to mean it.
--
-- READABLE BY ITS OWNER ALONE — deliberately narrower than `progress`, which accepted friends may read for
-- the badges view. A per-answer log is a minute-by-minute record of when somebody was at their desk and how
-- long they hesitated; that is not something to hand to a friend for a leaderboard, and nothing in the app
-- asks for it.
--
-- Until this runs, everything carries on with the local window alone: app.js reports the missing table once,
-- to an admin only, and stops trying for the session.
-- ============================================================
create table if not exists public.review_log (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  card_id     text not null,
  reviewed_at timestamptz not null,
  grade       smallint not null check (grade between 1 and 4),
  state       smallint not null check (state between 0 and 3),  -- 0 new, 1 learning, 2 relearning, 3 review
  prev_min    integer  not null default 0,                     -- the interval the card was on, in minutes
  next_min    integer  not null default 0,                     -- the delay the grade bought, in minutes
  ease100     integer  not null default 0,                     -- ease x100, or FSRS difficulty x100
  ds          integer  not null default 0,                     -- time taken, in tenths of a second, capped
  created_at  timestamptz not null default now()
);

-- the two queries that exist: "everything of mine, oldest first" (the optimiser) and "this card's history"
create index if not exists review_log_user_time_idx on public.review_log (user_id, reviewed_at);
create index if not exists review_log_user_card_idx on public.review_log (user_id, card_id);

-- …and the one that makes a re-push harmless. A device that loses its high-water mark re-sends rows it has
-- already sent; without this they would double, and every count built on the log would drift upwards.
-- (card_id, reviewed_at) is unique per user in practice: one card cannot be answered twice in one millisecond.
create unique index if not exists review_log_dedupe_idx on public.review_log (user_id, card_id, reviewed_at);

alter table public.review_log enable row level security;

drop policy if exists "own review log readable" on public.review_log;
create policy "own review log readable" on public.review_log
  for select using (auth.uid() = user_id);

drop policy if exists "own review log insertable" on public.review_log;
create policy "own review log insertable" on public.review_log
  for insert with check (auth.uid() = user_id);

-- no update policy on purpose: the log is append-only, for its owner as much as for anyone else
drop policy if exists "own review log deletable" on public.review_log;
create policy "own review log deletable" on public.review_log
  for delete using (auth.uid() = user_id);


-- ============================================================
-- 11) DECK COLOUR  (run once, on top of the phase-2 block)
--
-- One column: the colour an author says their deck should arrive in, so a shared deck looks like itself on
-- somebody else's home page instead of falling back to the generic indigo every rule already declares.
--
-- IT IS A HINT, NOT A SETTING. A reader's own colour on that row (S.deckGroups, device-side) still wins,
-- so an author publishing an update can never repaint a row somebody has already coloured themselves.
--
-- SAFE TO SKIP, unlike the card-types block. A deck whose author chose no colour publishes with or without
-- this, and a deck that HAS one publishes anyway: app.js retries the request once with the colour left out
-- and tells the author it did not travel. Refusing to share a whole deck over a swatch would be the tail
-- wagging the dog — which is exactly why this reads as one `add column` and no policy of its own.
--
-- THE COLUMN GUARD NEEDS NO CHANGE, AND THAT IS WORTH SAYING RATHER THAN LEAVING TO BE INFERRED.
-- `guard_user_deck_columns()` names the columns a non-admin may NOT write and restores those; it is a
-- deny-list, not an allow-list, so a new column is client-writable the moment it exists. That is right
-- here — `color` is the owner's to set, and RLS already limits the ROWS they may write to their own decks.
-- It is exactly wrong for anything server-maintained: **a column the server keeps must be ADDED to the
-- guard in the same block that creates it**, or it is client-writable and nothing will say so.
-- ============================================================
alter table public.user_decks add column if not exists color text;

-- a six-digit hex or nothing at all. The client validates the same shape before it stores or sends one —
-- this is the half that holds when the client is somebody else's.
alter table public.user_decks drop constraint if exists user_decks_color_chk;
alter table public.user_decks add constraint user_decks_color_chk
  check (color is null or color ~ '^#[0-9A-Fa-f]{6}$');


-- ============================================================
-- 12) SIGNING IN WITH A USERNAME  (run once)
--
-- Supabase authenticates on an EMAIL. Signing in with a username therefore means resolving one to the
-- other, and the whole difficulty is doing that without building an enumeration oracle.
--
-- THE OBVIOUS VERSION IS THE UNSAFE ONE. A `username -> email` lookup has to be readable by an ANONYMOUS
-- caller, because the reader doing the asking is not signed in yet — and usernames here are deliberately
-- public (the friends feature looks people up by one). So a plain lookup publishes every reader's email
-- address to anybody who can guess a username, which is a strictly worse position than the one this
-- database is in today, where `profiles` is readable by signed-in users only.
--
-- SO IT VERIFIES THE PASSWORD FIRST. The function answers only when the password is the account's own, so
-- it tells a caller nothing they were not a single request away from learning anyway: an attacker who
-- already has the password does not need the email address to be secret.
--
-- THE COST, STATED RATHER THAN HIDDEN. This is a password check that does not go through GoTrue, so
-- GoTrue's own sign-in rate limiting does not apply to it. Two things bound it in practice — bcrypt is
-- deliberately slow, so each call costs the database real CPU, and the API gateway rate-limits requests
-- per key regardless of endpoint — but if this project is ever a target worth attacking, the thing to do
-- is put a counter in front of it, not to widen it. It also means the password reaches Postgres as a
-- parameter: keep `log_min_duration_statement` off, or a slow call could write one into the logs.
--
-- IT IS OPTIONAL. Without it every reader still signs in by email; app.js says so in those words when a
-- username is typed into a database that has not run this.
-- ============================================================
create extension if not exists pgcrypto;

create or replace function public.login_email(uname text, pw text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare addr text;
begin
  -- the username is stored lower-case and constrained to ^[a-z0-9_]{3,24}$; fold the caller's copy so a
  -- capital in a typed username is not a failed sign-in the reader cannot see the cause of
  select u.email into addr
    from public.profiles p
    join auth.users u on u.id = p.id
   where p.username = lower(btrim(uname))
     and u.encrypted_password is not null
     and u.encrypted_password = crypt(pw, u.encrypted_password)
   limit 1;
  return addr;   -- null when there is no such username OR the password is wrong: one answer, two causes
end $$;

-- the caller has not signed in yet, which is the entire point of the function
revoke all on function public.login_email(text, text) from public;
grant execute on function public.login_email(text, text) to anon, authenticated;


-- ============================================================================================
-- 13) COMMUNITY CARD DIFFICULTY  (run once)
-- ============================================================================================
-- Four integers per card, pooled over every reader: how many times it was answered Again, Hard, Good
-- and Easy. The site turns them into the figure out of 100 that a card's stars show once it has been
-- answered 20 times; below that the editorial 1-5 rating stands in.
--
-- THERE IS DELIBERATELY NO PER-READER ROW. What this table holds cannot say who answered what — it is
-- four counters and a card id, and that is the whole of the privacy design. Nothing here is joined to
-- auth.users, and nothing needs to be.
--
-- READ BY EVERYONE, WRITTEN BY NOBODY. The publishable key ships in app.js, so a table a browser may
-- write to is a table anyone may write anything to: there is no insert, update or delete policy at
-- all, and the only way in is the function below, which can add one to a counter and do nothing else.

create table if not exists public.card_stats (
  card_id text primary key,
  a int not null default 0,   -- Again
  h int not null default 0,   -- Hard
  g int not null default 0,   -- Good
  e int not null default 0,   -- Easy
  updated_at timestamptz not null default now()
);

alter table public.card_stats enable row level security;

drop policy if exists "card stats are public" on public.card_stats;
create policy "card stats are public" on public.card_stats for select using (true);
-- and no write policy: RLS denies by default, so the table is read-only to every client

-- One call per flush, carrying however many cards the reader graded in the last few seconds. The
-- increments are CLAMPED: a caller can add at most a few counts per card per call, so a hostile client
-- cannot move a rating with one request, and the honest client never comes close to the ceiling.
create or replace function public.bump_card_grades(rows jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r jsonb;
begin
  if jsonb_typeof(rows) <> 'array' or jsonb_array_length(rows) > 500 then return; end if;
  for r in select * from jsonb_array_elements(rows) loop
    -- a card id is a slug or a community card's u_<deck>_<n>; anything else is not ours to count
    continue when coalesce(r->>'card_id', '') !~ '^[A-Za-z0-9_~.:-]{1,64}$';
    insert into public.card_stats as s (card_id, a, h, g, e, updated_at)
    values (
      r->>'card_id',
      least(greatest(coalesce((r->>'a')::int, 0), 0), 50),
      least(greatest(coalesce((r->>'h')::int, 0), 0), 50),
      least(greatest(coalesce((r->>'g')::int, 0), 0), 50),
      least(greatest(coalesce((r->>'e')::int, 0), 0), 50),
      now()
    )
    on conflict (card_id) do update
      set a = s.a + excluded.a, h = s.h + excluded.h,
          g = s.g + excluded.g, e = s.e + excluded.e, updated_at = now();
  end loop;
end $$;

revoke all on function public.bump_card_grades(jsonb) from public;
grant execute on function public.bump_card_grades(jsonb) to anon, authenticated;
