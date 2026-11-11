import Image from "next/image";
import Link from "next/link";

const footerGroups = [
  {
    title: "Matchday",
    links: [
      { href: "/scores", label: "Live scores" },
      { href: "/fixtures", label: "Fixtures & results" },
      { href: "/leagues/39/standings", label: "Premier League table" },
    ],
  },
  {
    title: "The game",
    links: [
      { href: "/news", label: "Latest stories" },
      { href: "/transfers", label: "Transfer centre" },
      { href: "/videos", label: "Videos" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/creator", label: "Creator hub" },
      { href: "/profile", label: "Your profile" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

const socialLinks = [
  { href: "https://www.facebook.com/share/19HXSZQav5", label: "Facebook" },
  { href: "https://www.linkedin.com/in/nayeem2k6", label: "LinkedIn" },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-white/[0.08] bg-[#050b09]/65 sm:mt-16">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-10 sm:px-8 sm:pb-8 sm:pt-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div className="max-w-sm">
            <Link
              aria-label="Football Plus home"
              className="inline-flex items-center text-xl font-black tracking-[-0.05em] text-white"
              href="/"
            >
              FOOTBALL<span className="text-lime-300">+</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/45">
              The game is better together. Your matchday, stories and football
              community — all in one place.
            </p>
            <Link
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-lime-200/20 px-4 py-2 text-xs font-semibold text-lime-100 transition hover:border-lime-200/40 hover:bg-lime-200/[0.06]"
              href="/creator"
            >
              Join the conversation <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {footerGroups.map((group) => (
            <nav aria-label={group.title} key={group.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex min-h-6 items-center text-sm text-white/45 transition hover:text-lime-100"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <nav aria-label="Social media">
            <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">
              Follow us
            </h2>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    className="inline-flex min-h-6 items-center text-sm text-white/45 transition hover:text-lime-100"
                    href={link.href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <section
          aria-label="Developer credit"
          className="mt-10 flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:mt-12 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
        >
          <div className="relative h-20 w-20 shrink-0">
            <span
              aria-hidden="true"
              className="absolute -inset-1 rounded-full bg-lime-300/20 blur-md"
            />
            <Image
              alt="Nayeem Babu"
              className="relative h-20 w-20 rounded-full border-2 border-lime-200/50 object-cover object-center shadow-[0_0_24px_rgba(190,242,100,0.12)]"
              height={80}
              src="https://i.ibb.co.com/zhmsV8sw/IMG-20261021-113552.jpg"
              unoptimized
              width={80}
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white sm:text-base">
              Designed &amp; Developed by{" "}
              <span className="text-lime-200">Nayeem Babu</span>
            </p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-white/60">
              Full-Stack Web Developer (MERN)
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-white/40 sm:text-sm">
              Building modern, responsive and user-friendly web applications.
            </p>
          </div>
        </section>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.08] pt-5 text-[11px] leading-5 text-white/35 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Football+. Made for the love of the game.</p>
          <p>Football data supplied by API-FOOTBALL. Match times shown in UTC.</p>
        </div>
      </div>
    </footer>
  );
}
