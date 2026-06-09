import { updateContactStatusAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type ContactMessage = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  topic: string;
  message: string;
  status: string;
  source: string;
  created_at: string;
};

type NewsletterSubscriber = {
  id: string;
  email: string;
  status: string;
  source: string;
  created_at: string;
};

const messageStatuses = ["new", "reviewed", "replied", "closed"];

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminMessagesPage() {
  const { email, supabase } = await requireAdmin();
  const [{ data: messagesData }, { data: subscribersData }] = await Promise.all([
    supabase
      .from("contact_messages")
      .select("id,customer_name,customer_email,customer_phone,topic,message,status,source,created_at")
      .order("created_at", { ascending: false })
      .limit(80),
    supabase
      .from("newsletter_subscribers")
      .select("id,email,status,source,created_at")
      .order("created_at", { ascending: false })
      .limit(80),
  ]);

  const messages = (messagesData ?? []) as ContactMessage[];
  const subscribers = (subscribersData ?? []) as NewsletterSubscriber[];

  return (
    <main className="min-h-screen bg-ink px-6 pb-20 pt-32 text-gallery-white lg:px-10 lg:pt-40">
      <section className="mx-auto max-w-site">
        <AdminNav email={email} />

        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
            Collector Messages
          </p>
          <h2 className="mt-4 font-serif text-5xl font-light leading-none sm:text-7xl">
            Questions, custom requests, and newsletter leads
          </h2>
          <p className="mt-5 text-sm leading-7 text-gallery-white/62">
            Respond to collector questions, custom order enquiries, and people who want
            new artwork release updates.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
          <section className="space-y-5" aria-labelledby="messages-heading">
            <h3 id="messages-heading" className="sr-only">
              Contact messages
            </h3>
            {messages.length ? (
              messages.map((message) => (
                <article
                  key={message.id}
                  className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.16)] lg:p-7"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                          {formatStatus(message.status)}
                        </span>
                        <span className="text-xs uppercase tracking-[0.2em] text-gallery-white/45">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                      <h4 className="mt-5 font-serif text-4xl">{message.customer_name}</h4>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-gold">
                        {message.topic}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gallery-white/65">
                        <a className="hover:text-gold" href={`mailto:${message.customer_email}`}>
                          {message.customer_email}
                        </a>
                        {message.customer_phone ? (
                          <a className="hover:text-gold" href={`tel:${message.customer_phone}`}>
                            {message.customer_phone}
                          </a>
                        ) : null}
                      </div>
                    </div>
                    <form action={updateContactStatusAction} className="min-w-56 rounded-card bg-ink p-4">
                      <input type="hidden" name="id" value={message.id} />
                      <label className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                        Status
                        <select
                          name="status"
                          defaultValue={message.status}
                          className="mt-3 min-h-11 w-full rounded-card border border-gallery-white/15 bg-ink px-3 text-sm normal-case tracking-normal text-gallery-white outline-none focus:border-gold"
                        >
                          {messageStatuses.map((status) => (
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
                        Update message
                      </button>
                    </form>
                  </div>
                  <p className="mt-6 whitespace-pre-line text-base leading-8 text-gallery-white/75">
                    {message.message}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-8 text-gallery-white/65">
                No collector messages yet.
              </div>
            )}
          </section>

          <aside className="rounded-card border border-gallery-white/10 bg-gallery-white/[0.04] p-5 lg:sticky lg:top-32">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              Newsletter
            </p>
            <h3 className="mt-4 font-serif text-4xl">Collector List</h3>
            <p className="mt-4 text-sm leading-7 text-gallery-white/60">
              People who asked to receive artwork releases, collector notes, and private
              gallery updates.
            </p>
            <ul className="mt-6 space-y-4">
              {subscribers.length ? (
                subscribers.map((subscriber) => (
                  <li
                    key={subscriber.id}
                    className="border-b border-gallery-white/10 pb-4 text-sm last:border-b-0 last:pb-0"
                  >
                    <a className="font-semibold hover:text-gold" href={`mailto:${subscriber.email}`}>
                      {subscriber.email}
                    </a>
                    <div className="mt-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-gallery-white/40">
                      <span>{subscriber.status}</span>
                      <span>{formatDate(subscriber.created_at)}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gallery-white/55">No subscribers yet.</li>
              )}
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
