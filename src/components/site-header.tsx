import Link from "next/link";
import { AccountLink } from "./auth/account-link";

const navItems = [
  { href: "/scores", label: "Scores" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/leagues/39/standings", label: "Tables" },
  { href: "/teams", label: "Teams" },
  { href: "/news", label: "News" },
  { href: "/transfers", label: "Transfers" },
  { href: "/videos", label: "Videos" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#07110e]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-3 sm:px-8 sm:py-3.5">
        <Link
          aria-label="Football Plus home"
          className="inline-flex min-h-10 items-center text-lg font-black tracking-[-0.04em] text-white sm:text-xl"
          href="/"
        >
          <span
            aria-hidden="true"
            className="mr-2.5 flex h-7 w-7 items-center justify-center rounded-full border border-lime-200/30 bg-lime-200/[0.08] sm:h-8 sm:w-8"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-lime-300 shadow-[0_0_14px_rgba(190,242,100,0.7)] sm:h-3 sm:w-3" />
          </span>
          FOOTBALL<span className="text-lime-300">+</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className="hidden min-h-10 items-center rounded-full px-3 text-xs font-medium text-white/55 transition hover:text-lime-100 md:inline-flex lg:px-4 lg:text-sm"
            href="/creator"
          >
            Creator hub
          </Link>
          <AccountLink />
        </div>
        <nav
          aria-label="Main navigation"
          className="order-3 -mx-4 flex w-[calc(100%+2rem)] snap-x gap-1 overflow-x-auto border-t border-white/[0.06] px-3 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:w-[calc(100%+4rem)] sm:px-7 md:order-none md:mx-0 md:w-auto md:gap-0.5 md:border-0 md:px-0 md:pt-0"
        >
          {navItems.map((item) => (
            <Link
              className="min-h-9 shrink-0 snap-start whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime-200 md:px-3 md:text-xs lg:px-3.5"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
