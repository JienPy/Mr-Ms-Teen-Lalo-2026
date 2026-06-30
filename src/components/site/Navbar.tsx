import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import barangaySeal from "@/assets/barangay-seal.jpg";
import skLogo from "@/assets/sk-logo.jpg";
import { cn } from "@/lib/utils";

const links = [
  { id: "announcements", label: "News" },
  { id: "about", label: "About" },
  { id: "leaderboard", label: "Top 7" },
  { id: "candidates", label: "Candidates" },
  { id: "gallery", label: "Gallery" },
  { id: "videos", label: "Videos" },
  { id: "tickets", label: "Tickets" },
  { id: "sponsors", label: "Sponsors" },
  { id: "officials", label: "Officials" },
];

export function Navbar({ hiddenIds = [] }: { hiddenIds?: string[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleLinks = links.filter((l) => !hiddenIds.includes(l.id));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled || mobileOpen
          ? "bg-(--emerald-deep)/85 backdrop-blur-xl border-b border-(--gold)/25 py-2"
          : "bg-transparent py-4",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="lg:hidden grid h-10 w-10 shrink-0 place-items-center rounded-full border border-(--gold)/35 bg-(--emerald-deep)/55 text-(--gold-soft) backdrop-blur-md transition-colors hover:border-(--gold) hover:text-(--gold)"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <a href="#top" onClick={() => setMobileOpen(false)} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 group lg:flex-none">
          <img src={barangaySeal} alt="Barangay Lalo seal" className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full ring-1 ring-(--gold)/50" />
          <img src={skLogo} alt="SK Barangay Lalo" className="hidden min-[380px]:block h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-full ring-1 ring-(--gold)/50" />
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[9px] min-[380px]:text-[10px] uppercase tracking-[0.24em] min-[380px]:tracking-[0.32em] text-(--gold-soft)/80">SK Barangay Lalo</div>
            <div className="font-display text-xs sm:text-sm text-gold-gradient truncate">Mr. & Ms. Teen Lalo 2026</div>
          </div>
        </a>
        <nav className="hidden lg:flex items-center gap-7">
          {visibleLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="text-xs uppercase tracking-[0.25em] text-(--ivory)/80 hover:text-(--gold-soft) transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-(--gold) after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <Link to="/auth" aria-label="Admin access" className="hidden min-[360px]:block h-2 w-2 rounded-full bg-(--gold)/30 hover:bg-(--gold) transition-colors" />
        </div>
      </div>
      <div
        id="mobile-navigation"
        className={cn(
          "lg:hidden overflow-hidden border-t border-(--gold)/15 transition-[max-height,opacity] duration-300",
          mobileOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-2 md:grid-cols-3">
          {visibleLinks.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg border border-(--gold)/20 bg-(--emerald-mid)/35 px-3 py-3 text-center text-[11px] uppercase tracking-[0.22em] text-(--ivory)/82 transition-colors hover:border-(--gold)/60 hover:text-(--gold-soft)"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
