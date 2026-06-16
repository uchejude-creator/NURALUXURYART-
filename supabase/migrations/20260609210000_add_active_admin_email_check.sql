create or replace function public.is_active_admin_email(candidate_email text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin
    where lower(admin.email) = lower(trim(candidate_email))
      and admin.active = true
  );
$$;

revoke all on function public.is_active_admin_email(text) from public;
grant execute on function public.is_active_admin_email(text) to anon, authenticated;
