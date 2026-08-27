-- ============================================================================
-- WHICH OPTIONAL SCHEMA BLOCKS THIS DATABASE ALREADY HAS
-- ============================================================================
-- `supabase-schema.sql` is fifteen blocks: 1-7 are the base, and 8-15 are each
-- "run once, on top". Every one of them DEGRADES rather than breaking -- a
-- feature whose block is missing says so in a sentence and the rest of the site
-- carries on -- which is the right design and also why it is easy to lose track
-- of which have been run.
--
-- This says. It is READ-ONLY: it creates nothing, changes nothing and can be
-- run as often as you like. Paste it into the Supabase SQL editor; each row
-- comes back true or false, and a false row is a block still to run.
--
-- Re-running a block that is already there is safe: every one of them is
-- written with `if not exists` / `create or replace` / `drop ... if exists`.
-- ============================================================================
select * from (values
  ('8  · card types',        to_regclass('public.user_decks') is not null and exists (
       select 1 from information_schema.columns
        where table_schema='public' and table_name='user_decks' and column_name='types')),
  ('9  · glossary off',      exists (
       select 1 from information_schema.check_constraints
        where constraint_name='user_decks_gloss_mode_check' and check_clause like '%off%')),
  ('10 · review log',        to_regclass('public.review_log') is not null),
  ('11 · deck colour',       exists (
       select 1 from information_schema.columns
        where table_schema='public' and table_name='user_decks' and column_name='color')),
  ('12 · username sign-in',  exists (
       select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and p.proname='login_email')),
  ('13 · card difficulty',   to_regclass('public.card_stats') is not null and exists (
       select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and p.proname='bump_card_grades')),
  ('14 · account theme',     exists (
       select 1 from information_schema.columns
        where table_schema='public' and table_name='profiles' and column_name='theme')),
  ('15 · game statistics',   to_regclass('public.game_stats') is not null and exists (
       select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and p.proname='bump_game_score'))
) as t(block, present)
order by block;
