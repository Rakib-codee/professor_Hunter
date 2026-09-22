-- Professor Hunter — initial schema. See PLAN.md §5 for rationale.
-- Security model: app users never read `professors` directly. Browsing goes through
-- `professors_public` (no email, no notes); email only via reveal_professor_email() with a daily quota.

-- ============ enums ============
create type email_type       as enum ('university','personal','none');
create type accepts_intl     as enum ('confirmed','team-reported','unknown','no');
create type professor_status as enum ('active','bounced','moved','retired');
create type student_role     as enum ('student','admin');
create type degree_type      as enum ('master','phd');
create type draft_tone       as enum ('formal','concise');
create type outreach_status  as enum ('sent','replied_positive','replied_negative','replied_conditional','no_reply','bounced');
create type report_type      as enum ('wrong_email','bounced','moved','not_accepting','other');
create type report_status    as enum ('open','resolved');
create type usage_action     as enum ('reveal_email','generate_draft');

-- ============ helpers ============
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============ universities ============
create table universities (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null unique,
  name_cn     text,
  province    text,
  city        text,
  csc_type_b  boolean not null default true,  -- unverified; UI hides the badge (PLAN Q13)
  website     text,
  created_at  timestamptz not null default now()
);

-- ============ professors ============
create table professors (
  id               uuid primary key default gen_random_uuid(),
  university_id    uuid not null references universities(id) on delete restrict,
  school           text,
  field            text not null check (field in
                     ('Computer Science and Technology','Civil Engineering','Software Engineering')),
  name_en          text not null,
  name_cn          text,
  name_cn_inferred boolean not null default false,  -- true when the CSV notes say the Chinese name was guessed
  title            text,
  research_area    text,
  research_tags    text[] not null default '{}',
  email            text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  email_type       email_type not null default 'none',
  accepts_intl     accepts_intl not null default 'unknown',
  source_url       text,
  last_verified    text,        -- raw value from the CSV ("2025-01", "2026-09-22", ...)
  last_verified_on date,        -- parsed for sorting; null if unparseable
  notes            text,        -- internal provenance; never shown to students
  gender           text,
  status           professor_status not null default 'active',
  search_vector    tsvector generated always as (
                     to_tsvector('simple',
                       coalesce(name_en,'') || ' ' || coalesce(name_cn,'') || ' ' ||
                       coalesce(research_area,'') || ' ' || coalesce(school,''))) stored,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create unique index professors_uni_email_uidx
  on professors (university_id, lower(email)) where email is not null;
create unique index professors_uni_name_field_uidx
  on professors (university_id, lower(name_en), field) where email is null;
create index professors_search_idx     on professors using gin (search_vector);
create index professors_tags_idx       on professors using gin (research_tags);
create index professors_field_idx      on professors (field, status);
create index professors_university_idx on professors (university_id);
create trigger professors_updated_at before update on professors
  for each row execute function set_updated_at();

-- ============ students ============
create table students (
  id                        uuid primary key references auth.users(id) on delete cascade,
  full_name                 text,
  nationality               text,
  home_university           text,
  major                     text,
  cgpa                      numeric(5,2) check (cgpa is null or cgpa >= 0),
  cgpa_scale                numeric(5,2) check (cgpa_scale is null or cgpa_scale > 0),
  graduation_year           int check (graduation_year is null or graduation_year between 1990 and 2040),
  degree_applying           degree_type,
  intake_year               int not null default 2027 check (intake_year between 2025 and 2035),
  ielts                     numeric(3,1),
  toefl                     int,
  hsk                       int check (hsk is null or hsk between 1 and 9),
  achievements              text,
  target_field              text check (target_field is null or target_field in
                              ('Computer Science and Technology','Civil Engineering','Software Engineering')),
  research_interests        text,
  research_tags             text[] not null default '{}',
  cv_path                   text,
  role                      student_role not null default 'student',
  onboarding_completed_at   timestamptz,
  last_viewed_professor_id  uuid references professors(id) on delete set null,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  check (cgpa is null or cgpa_scale is null or cgpa <= cgpa_scale)
);
create trigger students_updated_at before update on students
  for each row execute function set_updated_at();

-- security definer so RLS policies on `students` can call it without recursion.
-- Declared here (not in helpers) because `language sql` bodies are validated at creation
-- time, so `students` must already exist.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from students where id = auth.uid() and role = 'admin');
$$;

-- profile row is created automatically on signup
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into students (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- users cannot promote themselves. SQL editor / secret key (auth.uid() is null) may.
create or replace function protect_student_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not is_admin() then
    raise exception 'role change not allowed' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger students_protect_role before update on students
  for each row execute function protect_student_role();

-- ============ saved / drafts / outreach / reports / usage_log ============
create table saved (
  student_id   uuid not null references students(id) on delete cascade,
  professor_id uuid not null references professors(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (student_id, professor_id)
);

create table drafts (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references students(id) on delete cascade,
  professor_id      uuid not null references professors(id) on delete cascade,
  subject           text not null,
  body              text not null,
  tone              draft_tone not null default 'formal',
  model             text not null,
  prompt_tokens     int,
  completion_tokens int,
  created_at        timestamptz not null default now()
);
create index drafts_student_idx on drafts (student_id, created_at desc);

create table outreach (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  professor_id  uuid not null references professors(id) on delete cascade,
  draft_id      uuid references drafts(id) on delete set null,
  sent_on       date not null default current_date,
  status        outreach_status not null default 'sent',
  reply_on      date,
  follow_up_on  date,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index outreach_student_idx   on outreach (student_id, sent_on desc);
create index outreach_professor_idx on outreach (professor_id);
create trigger outreach_updated_at before update on outreach
  for each row execute function set_updated_at();

create table reports (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid references students(id) on delete set null,
  professor_id uuid not null references professors(id) on delete cascade,
  type         report_type not null,
  message      text,
  status       report_status not null default 'open',
  created_at   timestamptz not null default now()
);
create index reports_open_idx on reports (status, created_at desc);

-- marking outreach as bounced auto-files a report
create or replace function outreach_bounced_report() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'bounced' and old.status is distinct from 'bounced' then
    insert into reports (student_id, professor_id, type, message)
    values (new.student_id, new.professor_id, 'bounced', 'Auto-reported from tracker');
  end if;
  return new;
end $$;
create trigger outreach_bounced after update of status on outreach
  for each row execute function outreach_bounced_report();

create table usage_log (
  id           bigint generated always as identity primary key,
  student_id   uuid not null references students(id) on delete cascade,
  action       usage_action not null,
  professor_id uuid references professors(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index usage_log_quota_idx on usage_log (student_id, action, created_at desc);

-- ============ public view: no email, no notes, inferred Chinese names hidden ============
-- Owned by postgres, so it bypasses RLS on `professors` by design; the base table stays locked.
create view professors_public as
select p.id, p.university_id, u.name_en as university_name, u.province, u.city,
       p.school, p.field, p.name_en,
       case when p.name_cn_inferred then null else p.name_cn end as name_cn,
       p.title, p.research_area, p.research_tags,
       (p.email is not null) as has_email, p.email_type,
       p.accepts_intl,
       case p.accepts_intl
         when 'confirmed' then 0 when 'team-reported' then 1 when 'unknown' then 2 else 3
       end as accepts_rank,
       p.source_url, p.last_verified, p.last_verified_on, p.status, p.search_vector
from professors p
join universities u on u.id = p.university_id
where p.status <> 'retired';

-- ============ search ============
-- Turns free text into a safe prefix tsquery ("geotech eng" -> 'geotech':* & 'eng':*).
-- Strips anything that is not a letter/digit so user input cannot break to_tsquery. Max 5 terms.
create or replace function build_prefix_tsquery(p_q text) returns tsquery
language sql immutable as $$
  select case when count(*) = 0 then null
         else to_tsquery('simple', string_agg(quote_literal(tok) || ':*', ' & ')) end
  from (
    select tok from regexp_split_to_table(
      regexp_replace(coalesce(p_q, ''), '[^[:alnum:]]+', ' ', 'g'), '\s+') as tok
    where tok <> '' limit 5
  ) t;
$$;

create or replace function search_professors(
  p_field text,
  p_tags text[] default null,
  p_university_id uuid default null,
  p_province text default null,
  p_accepts text[] default null,
  p_university_email_only boolean default false,
  p_q text default null,
  p_page int default 1,
  p_page_size int default 20)
returns table (total bigint, row_json jsonb)
language sql stable set search_path = public as $$
  with q as (select build_prefix_tsquery(p_q) as tsq),
  base as (
    select v.* from professors_public v, q
    where v.field = p_field
      and (p_university_id is null or v.university_id = p_university_id)
      and (p_province is null or v.province = p_province)
      and (p_accepts is null or v.accepts_intl::text = any(p_accepts))
      and (not p_university_email_only or v.email_type = 'university')
      and (p_tags is null
           or v.research_tags && (select coalesce(array_agg(t), '{}') from unnest(p_tags) t where t <> '__other__')
           or ('__other__' = any(p_tags) and v.research_tags = '{}'))
      and (q.tsq is null or v.search_vector @@ q.tsq)
  )
  select (select count(*) from base) as total, to_jsonb(b) - 'search_vector' as row_json
  from base b
  order by b.accepts_rank, b.last_verified_on desc nulls last, b.name_en
  limit greatest(least(p_page_size, 50), 1)
  offset greatest(p_page - 1, 0) * greatest(least(p_page_size, 50), 1);
$$;

create or replace function professor_facets(p_field text) returns jsonb
language sql stable set search_path = public as $$
  select jsonb_build_object(
    'total', (select count(*) from professors_public where field = p_field),
    'tags', (select coalesce(jsonb_agg(jsonb_build_object('tag', tag, 'count', c) order by c desc), '[]')
             from (select unnest(research_tags) as tag, count(*) as c
                   from professors_public where field = p_field group by 1) t),
    'untagged', (select count(*) from professors_public where field = p_field and research_tags = '{}'),
    'universities', (select coalesce(jsonb_agg(jsonb_build_object(
                       'id', university_id, 'name', university_name, 'province', province, 'count', c)
                       order by c desc), '[]')
             from (select university_id, university_name, province, count(*) as c
                   from professors_public where field = p_field group by 1, 2, 3) t),
    'accepts', (select coalesce(jsonb_object_agg(accepts_intl, c), '{}')
             from (select accepts_intl, count(*) as c
                   from professors_public where field = p_field group by 1) t));
$$;

create or replace function major_counts() returns jsonb
language sql stable set search_path = public as $$
  select coalesce(jsonb_object_agg(field, jsonb_build_object('professors', c, 'universities', u)), '{}')
  from (select field, count(*) as c, count(distinct university_id) as u
        from professors_public group by 1) t;
$$;

-- ============ email reveal with daily quota (product rule 2) ============
-- 30 distinct professors per day on the free tier; re-revealing the same professor is free.
create or replace function reveal_professor_email(p_professor_id uuid)
returns table (out_email text, out_email_type email_type, reveals_used int, reveals_limit int)
language plpgsql security definer set search_path = public as $$
declare
  v_limit constant int := 30;  -- mirrored in lib/constants.ts
  v_used  int;
  v_seen  boolean;
  v_email text;
  v_type  email_type;
begin
  if auth.uid() is null then
    raise exception 'auth required' using errcode = '42501';
  end if;

  select count(distinct professor_id), coalesce(bool_or(professor_id = p_professor_id), false)
    into v_used, v_seen
    from usage_log
   where student_id = auth.uid() and action = 'reveal_email'
     and created_at >= date_trunc('day', now());

  if not v_seen and v_used >= v_limit then
    raise exception 'daily reveal limit reached' using errcode = 'P0001';
  end if;

  select p.email, p.email_type into v_email, v_type
    from professors p where p.id = p_professor_id and p.status <> 'retired';
  if not found then
    raise exception 'professor not found' using errcode = 'P0002';
  end if;

  insert into usage_log (student_id, action, professor_id)
  values (auth.uid(), 'reveal_email', p_professor_id);

  return query select v_email, v_type, (case when v_seen then v_used else v_used + 1 end), v_limit;
end $$;

-- ============ draft quota (called with the secret key from /api/draft) ============
create or replace function consume_draft_quota(p_student_id uuid, p_professor_id uuid)
returns table (allowed boolean, used int, quota int)
language plpgsql security definer set search_path = public as $$
declare
  v_limit constant int := 20;  -- mirrored in lib/constants.ts
  v_used  int;
begin
  select count(*) into v_used
    from usage_log
   where student_id = p_student_id and action = 'generate_draft'
     and created_at >= date_trunc('day', now());

  if v_used >= v_limit then
    return query select false, v_used, v_limit;
    return;
  end if;

  insert into usage_log (student_id, action, professor_id)
  values (p_student_id, 'generate_draft', p_professor_id);
  return query select true, v_used + 1, v_limit;
end $$;
revoke execute on function consume_draft_quota(uuid, uuid) from public, anon, authenticated;

-- ============ reply-rate line (only when >= 5 outreach rows exist) ============
create or replace function professor_reply_stats(p_professor_id uuid)
returns table (total int, replied int)
language sql stable security definer set search_path = public as $$
  select count(*)::int,
         count(*) filter (where status in ('replied_positive','replied_negative','replied_conditional'))::int
    from outreach
   where professor_id = p_professor_id
  having count(*) >= 5;
$$;

-- ============ admin stats ============
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
               count(*) filter (where o.status like 'replied_%') as replied
          from outreach o
          join professors p on p.id = o.professor_id
          join universities u on u.id = p.university_id
         group by u.name_en having count(*) >= 5 order by sent desc) t),
    'open_reports', (select count(*) from reports where status = 'open'));
end $$;

-- ============ RLS ============
alter table universities enable row level security;
alter table professors   enable row level security;
alter table students     enable row level security;
alter table saved        enable row level security;
alter table drafts       enable row level security;
alter table outreach     enable row level security;
alter table reports      enable row level security;
alter table usage_log    enable row level security;

-- universities: public read, admin write
create policy universities_read  on universities for select using (true);
create policy universities_admin on universities for all using (is_admin()) with check (is_admin());

-- professors: NO read policy for students/anon (they use professors_public + RPC). Admin full.
create policy professors_admin on professors for all using (is_admin()) with check (is_admin());

-- students: own row; admin can read all
create policy students_select_own on students for select using (id = auth.uid() or is_admin());
create policy students_insert_own on students for insert with check (id = auth.uid());
create policy students_update_own on students for update using (id = auth.uid()) with check (id = auth.uid());

-- own-rows tables
create policy saved_own    on saved    for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy drafts_own   on drafts   for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy outreach_own on outreach for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy reports_own_select   on reports for select using (student_id = auth.uid() or is_admin());
create policy reports_own_insert   on reports for insert with check (student_id = auth.uid());
create policy reports_admin_update on reports for update using (is_admin()) with check (is_admin());
create policy usage_log_own_select on usage_log for select using (student_id = auth.uid() or is_admin());
-- usage_log inserts happen only inside security-definer functions; no insert policy on purpose.

-- ============ grants for the Data API roles ============
grant select on professors_public to anon, authenticated;
grant execute on function build_prefix_tsquery(text) to anon, authenticated;
grant execute on function search_professors(text, text[], uuid, text, text[], boolean, text, int, int) to anon, authenticated;
grant execute on function professor_facets(text) to anon, authenticated;
grant execute on function major_counts() to anon, authenticated;
grant execute on function reveal_professor_email(uuid) to authenticated;
grant execute on function professor_reply_stats(uuid) to anon, authenticated;
grant execute on function admin_stats() to authenticated;
