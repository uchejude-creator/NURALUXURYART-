create or replace function public.is_nuraluxuryart_admin()
returns boolean
language sql
security invoker
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce((select (auth.jwt() ->> 'email')), ''))
  );
$$;

revoke all on function public.is_nuraluxuryart_admin() from public;
revoke all on function public.is_nuraluxuryart_admin() from anon;
grant execute on function public.is_nuraluxuryart_admin() to authenticated;

drop policy if exists "Admin users can read own access row" on public.admin_users;
create policy "Admin users can read own access row"
on public.admin_users
for select
to authenticated
using (
  active is true
  and lower(email) = lower(coalesce((select (auth.jwt() ->> 'email')), ''))
);
