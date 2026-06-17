drop policy if exists "Public can read approved customer reviews" on public.customer_reviews;
create policy "Public can read approved customer reviews"
on public.customer_reviews
for select
to anon
using (
  status = 'approved'
  and rating is not null
  and quote is not null
);

revoke execute on function public.get_review_invitation(uuid) from authenticated;
revoke execute on function public.submit_customer_review(uuid, integer, text, text) from authenticated;

create index if not exists customer_reviews_checkout_request_item_idx
on public.customer_reviews (checkout_request_item_id);

create index if not exists customer_reviews_artwork_idx
on public.customer_reviews (artwork_id);
