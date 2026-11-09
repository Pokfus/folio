-- Removes the answerDate deltas that hide the date-line templates (PR #640) from the live
-- content_overrides row, leaving every other edit in it untouched; cards left empty are dropped.
-- Tested against a copy of the live row: the result equals content-overrides-clean.json. Safe to re-run.
-- Run in the Supabase SQL Editor after merging. The row's trigger bumps updated_at, so visitors adopt it.
update public.content_overrides
set data = jsonb_set(
  data, '{cards}',
  coalesce((
    select jsonb_object_agg(key, value)
    from (
      select key,
             case when key = any (array['gr-522', 'gr-595', 'ps-028', 'ps-038', 'rm-325', 'rm-336', 'rm-371', 'rm-383', 'rm-384', 'rm-427', 'rm-430', 'ru-051', 'ru-057', 'us-060', 'us-074', 'cnh-274', 'cnh-276', 'cnh-280', 'cnh-608', 'ww2-168', 'ww2-197', 'ww2-441'])
                  then value - 'answerDate' else value end as value
      from jsonb_each(data -> 'cards')
    ) t
    where value <> '{}'::jsonb
  ), '{}'::jsonb)
)
where id = 1;
