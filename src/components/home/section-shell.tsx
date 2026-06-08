import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";

type SectionShellProps = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

export function SectionShell({ id, eyebrow, title, intro, children }: SectionShellProps) {
  return (
    <section id={id} className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-site">
        <Reveal>
          {eyebrow ? (
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-gold">
              {eyebrow}
            </p>
          ) : null}
          <div className="max-w-3xl">
            <h2 className="font-serif text-5xl font-light leading-[0.98] tracking-tight text-ink sm:text-7xl">
              {title}
            </h2>
            {intro ? <p className="mt-6 text-base leading-8 text-stone">{intro}</p> : null}
          </div>
        </Reveal>
        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  );
}
