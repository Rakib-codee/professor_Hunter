-- Fixes from the Supabase security + performance advisors, run after 0001 was applied.
--
-- Not fixed on purpose: lint `security_definer_view` on professors_public. The base table
-- `professors` has no read policy for students; the view (owned by postgres) is the only
-- browse surface and deliberately omits email/notes. Switching it to security_invoker would
-- require a select policy on professors, which would expose every email via REST.

-- ============ 1. RPC exposure ============
-- Postgres grants EXECUTE to PUBLIC on every new function, so 0001's grants never limited
-- who can call these through /rest/v1/rpc. Trigger bodies and admin/auth-only RPCs must
-- not be callable by anon. is_admin() stays callable: RLS policies evaluate it as the caller.
revoke execute on function set_updated_at()          from public, anon, authenticated;
revoke execute on function handle_new_user()         from public, anon, authenticated;
revoke execute on function protect_student_role()    from public, anon, authenticated;
revoke execute on function outreach_bounced_report() from public, anon, authenticated;
revoke execute on function reveal_professor_email(uuid) from public, anon;
revoke execute on function admin_stats()               from public, anon;
revoke execute on function professor_reply_stats(uuid) from public;
revoke execute on function build_prefix_tsquery(text)  from public;
revoke execute on function search_professors(text, text[], uuid, text, text[], boolean, text, int, int) from public;
revoke execute on function professor_facets(text)      from public;
revoke execute on function major_counts()              from public;

-- ============ 2. pinned search_path ============
alter function set_updated_at()         set search_path = public;
alter function build_prefix_tsquery(text) set search_path = public;

-- ============ 3. RLS: evaluate auth.uid()/is_admin() once per query, one policy per action ============
drop policy universities_admin on universities;
create policy universities_admin_insert on universities for insert with check ((select is_admin()));
create policy universities_admin_update on universities for update using ((select is_admin())) with check ((select is_admin()));
create policy universities_admin_delete on universities for delete using ((select is_admin()));

drop policy professors_admin on professors;
create policy professors_admin on professors for all
  using ((select is_admin())) with check ((select is_admin()));

drop policy students_select_own on students;
drop policy students_insert_own on students;
drop policy students_update_own on students;
create policy students_select_own on students for select
  using (id = (select auth.uid()) or (select is_admin()));
create policy students_insert_own on students for insert
  with check (id = (select auth.uid()));
create policy students_update_own on students for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy saved_own    on saved;
drop policy drafts_own   on drafts;
drop policy outreach_own on outreach;
create policy saved_own    on saved    for all
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));
create policy drafts_own   on drafts   for all
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));
create policy outreach_own on outreach for all
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

drop policy reports_own_select   on reports;
drop policy reports_own_insert   on reports;
drop policy reports_admin_update on reports;
create policy reports_own_select   on reports for select
  using (student_id = (select auth.uid()) or (select is_admin()));
create policy reports_own_insert   on reports for insert
  with check (student_id = (select auth.uid()));
create policy reports_admin_update on reports for update
  using ((select is_admin())) with check ((select is_admin()));

drop policy usage_log_own_select on usage_log;
create policy usage_log_own_select on usage_log for select
  using (student_id = (select auth.uid()) or (select is_admin()));

-- ============ 4. covering indexes for foreign keys ============
create index drafts_professor_idx       on drafts (professor_id);
create index outreach_draft_idx         on outreach (draft_id);
create index reports_professor_idx      on reports (professor_id);
create index reports_student_idx        on reports (student_id);
create index saved_professor_idx        on saved (professor_id);
create index students_last_viewed_idx   on students (last_viewed_professor_id);
create index usage_log_professor_idx    on usage_log (professor_id);
