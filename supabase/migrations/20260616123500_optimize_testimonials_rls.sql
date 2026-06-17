drop policy if exists "Public can read published testimonials" on public.testimonials;
drop policy if exists "Admins can manage testimonials" on public.testimonials;

create policy "Public can read published testimonials"
on public.testimonials
for select
to anon
using (is_published is true);

create policy "Admins can read testimonials"
on public.testimonials
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);

create policy "Admins can insert testimonials"
on public.testimonials
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);

create policy "Admins can update testimonials"
on public.testimonials
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
)
with check (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);

create policy "Admins can delete testimonials"
on public.testimonials
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users admin
    where admin.active is true
      and lower(admin.email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  )
);
