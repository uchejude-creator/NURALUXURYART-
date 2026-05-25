import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-ink text-gallery-white">
      <Image
        src="/images/hero/nuraluxuryart-hero.jpeg"
        alt="Hand-painted blue artwork displayed above a sofa in a refined luxury interior"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[58%_center] sm:object-[55%_center] lg:object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.42)_38%,rgba(0,0,0,0.1)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_0%,rgba(0,0,0,0.08)_36%,rgba(0,0,0,0.76)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-site flex-col justify-center px-7 pb-20 pt-32 sm:px-10 lg:px-16">
        <div className="max-w-[44rem] translate-y-4 lg:max-w-[64rem] lg:translate-y-8">
          <h1
            aria-label="Curated Art for Refined Spaces"
            className="font-serif text-[3.05rem] font-light leading-[0.86] tracking-[-0.02em] text-gallery-white min-[380px]:text-[3.45rem] min-[520px]:text-[4.9rem] md:text-[5.2rem] lg:text-[6.15rem] xl:text-[7rem]"
          >
            <span aria-hidden="true" className="min-[520px]:hidden">
              <span className="block">Curated Art</span>
              <span className="block">for Refined</span>
              <span className="block">Spaces</span>
            </span>
            <span aria-hidden="true" className="hidden min-[520px]:block md:hidden">
              <span className="block">Curated</span>
              <span className="block">Art for</span>
              <span className="block">Refined</span>
              <span className="block">Spaces</span>
            </span>
            <span aria-hidden="true" className="hidden md:block">
              <span className="block">Curated Art for</span>
              <span className="block">Refined Spaces</span>
            </span>
          </h1>
          <p className="mt-8 max-w-[17.75rem] text-[0.92rem] font-normal leading-7 tracking-normal text-gallery-white sm:max-w-[25rem] sm:text-base sm:font-medium sm:leading-8 sm:tracking-[0.08em]">
            Discover hand-painted artworks from Turkey, curated for collectors and
            interiors that value texture, elegance, and timeless presence.
          </p>

          <div className="mt-9 flex flex-col gap-8 min-[520px]:flex-row min-[520px]:items-center lg:mt-10 lg:gap-[28vw]">
            <a
              href="#featured-artworks"
              className="inline-flex min-h-14 w-fit min-w-44 items-center justify-center rounded-full bg-gold px-8 text-[0.66rem] font-bold uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gallery-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Shop the Gallery
            </a>
            <p className="hidden max-w-64 text-xs font-bold uppercase leading-tight tracking-[0.28em] text-gallery-white min-[520px]:block">
              <span className="text-gold">Turkish</span> Hand Painted{" "}
              <span className="text-gold">Art</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
