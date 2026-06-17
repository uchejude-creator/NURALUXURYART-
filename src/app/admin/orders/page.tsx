import Image from "next/image";
import Link from "next/link";

import { updateCheckoutStatusAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { formatCurrency } from "@/lib/format";
import { requireAdmin } from "@/lib/admin";
import { routes } from "@/lib/routes";

export const dynamic = "force-dynamic";

type CheckoutRequest = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_preference: string | null;
  delivery_country: string | null;
  delivery_state: string | null;
  delivery_city: string | null;
  delivery_address: string | null;
  delivery_landmark: string | null;
  delivery_note: string | null;
  item_count: number;
  total_amount: number;
  currency: "NGN";
  status: string;
  source: string;
  created_at: string;
};

type CheckoutItem = {
  id: string;
  request_id: string;
  artwork_id: string;
  artwork_slug: string;
  title: string;
  medium: string;
  price: number | null;
  quantity: number;
  image_src: string | null;
};

const checkoutStatuses = [
  "new",
  "contacted",
  "invoice_sent",
  "paid",
  "fulfilled",
  "cancelled",
];

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminOrdersPage() {
  const { email, supabase } = await requireAdmin();

  const { data: requestsData } = await supabase
    .from("checkout_requests")
    .select(
      "id,customer_name,customer_email,customer_phone,delivery_preference,delivery_country,delivery_state,delivery_city,delivery_address,delivery_landmark,delivery_note,item_count,total_amount,currency,status,source,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(80);

  const requests = (requestsData ?? []) as CheckoutRequest[];
  const requestIds = requests.map((request) => request.id);
  const { data: itemsData } = requestIds.length
    ? await supabase
        .from("checkout_request_items")
        .select("id,request_id,artwork_id,artwork_slug,title,medium,price,quantity,image_src")
        .in("request_id", requestIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const items = (itemsData ?? []) as CheckoutItem[];
  const itemsByRequest = items.reduce<Record<string, CheckoutItem[]>>((grouped, item) => {
    grouped[item.request_id] = [...(grouped[item.request_id] ?? []), item];
    return grouped;
  }, {});

  return (
    <main
      data-workspace-shell
      className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40"
    >
      <section className="mx-auto max-w-site">
        <AdminNav email={email} />

        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Checkout Requests
          </p>
          <h2 className="mt-4 font-serif text-5xl font-light leading-none sm:text-7xl">
            Collector orders and delivery notes
          </h2>
          <p className="mt-5 text-sm leading-7 text-gallery-white/62">
            Review selected artworks, contact the collector, confirm availability,
            then move each request through invoice, payment, and fulfilment.
          </p>
        </div>

        {requests.length ? (
          <div className="space-y-6">
            {requests.map((request) => (
              <article
                key={request.id}
                className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.18)] lg:p-7"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                        {formatStatus(request.status)}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-gallery-white/45">
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                    <h3 className="mt-5 font-serif text-4xl">{request.customer_name}</h3>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gallery-white/65">
                      <a className="hover:text-gold" href={`mailto:${request.customer_email}`}>
                        {request.customer_email}
                      </a>
                      <a className="hover:text-gold" href={`tel:${request.customer_phone}`}>
                        {request.customer_phone}
                      </a>
                    </div>
                  </div>

                  <form action={updateCheckoutStatusAction} className="rounded-card bg-ink p-4">
                    <input type="hidden" name="id" value={request.id} />
                    <label className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                      Status
                      <select
                        name="status"
                        defaultValue={request.status}
                        className="mt-3 min-h-11 w-full rounded-card border border-gallery-white/15 bg-ink px-3 text-sm normal-case tracking-normal text-gallery-white outline-none focus:border-gold"
                      >
                        {checkoutStatuses.map((status) => (
                          <option key={status} value={status}>
                            {formatStatus(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="submit"
                      className="mt-4 min-h-11 w-full rounded-full bg-gold px-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-gallery-white"
                    >
                      Update request
                    </button>
                  </form>
                </div>

                <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
                  <div className="rounded-card border border-gallery-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold">
                      Selected artworks
                    </p>
                    <ul className="mt-5 space-y-4">
                      {(itemsByRequest[request.id] ?? []).map((item) => (
                        <li key={item.id} className="grid gap-4 sm:grid-cols-[5.5rem_1fr]">
                          {item.image_src ? (
                            <Link
                              href={routes.artwork(item.artwork_slug)}
                              className="relative aspect-[4/5] overflow-hidden rounded-card bg-ink"
                            >
                              <Image
                                src={item.image_src}
                                alt={item.title}
                                fill
                                sizes="5.5rem"
                                className="object-cover"
                              />
                            </Link>
                          ) : (
                            <div className="aspect-[4/5] rounded-card bg-ink" />
                          )}
                          <div>
                            <Link
                              href={routes.artwork(item.artwork_slug)}
                              className="font-serif text-2xl transition-colors hover:text-gold"
                            >
                              {item.title}
                            </Link>
                            <p className="mt-1 text-sm text-gallery-white/60">{item.medium}</p>
                            <p className="mt-2 text-sm font-semibold">
                              {item.price ? formatCurrency(item.price) : "Available on request"} x{" "}
                              {item.quantity}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex items-center justify-between border-t border-gallery-white/10 pt-4 text-sm">
                      <span className="text-gallery-white/55">{request.item_count} item(s)</span>
                      <span className="font-semibold text-gallery-white">
                        {formatCurrency(request.total_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-card border border-gallery-white/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-gold">
                      Delivery details
                    </p>
                    <dl className="mt-5 space-y-4 text-sm">
                      {[
                        ["Preference", request.delivery_preference],
                        ["Country", request.delivery_country],
                        ["State", request.delivery_state],
                        ["City / Area", request.delivery_city],
                        ["Address", request.delivery_address],
                        ["Landmark", request.delivery_landmark],
                        ["Collector note", request.delivery_note],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs uppercase tracking-[0.2em] text-gallery-white/35">
                            {label}
                          </dt>
                          <dd className="mt-1 leading-6 text-gallery-white/72">
                            {value || "Not provided"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-8 text-gallery-white/65">
            No checkout requests yet.
          </div>
        )}
      </section>
    </main>
  );
}
