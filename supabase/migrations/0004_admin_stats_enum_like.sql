-- admin_stats() compared the outreach_status enum with LIKE ("operator does not exist:
-- outreach_status ~~ unknown"), so /admin failed for every admin. Cast to text.
-- Same body as 0001_init.sql otherwise.

create or replace function admin_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'users', (select count(*) from students),
    'drafts', (select count(*) from drafts),
    'outreach_by_status', (select coalesce(jsonb_object_agg(status, c), '{}')
                           from (select status, count(*) as c from outreach group by 1) t),
    'reply_rate_by_university', (select coalesce(jsonb_agg(row_to_json(t)), '[]') from (
        select u.name_en, count(*) as sent,
               count(*) filter (where o.status::text like 'replied_%') as replied
          from outreach o
          join professors p on p.id = o.professor_id
          join universities u on u.id = p.university_id
         group by u.name_en having count(*) >= 5 order by sent desc) t),
    'open_reports', (select count(*) from reports where status = 'open'));
end $$;
