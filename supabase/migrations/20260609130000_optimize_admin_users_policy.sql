drop policy if exists "Admin users can read own access row" on public.admin_users;
create policy "Admin users can read own access row"
on public.admin_users
for select
to authenticated
using (
  active is true
  and lower(email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
);
