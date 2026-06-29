import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import barangaySeal from "@/assets/barangay-seal.jpg";
import skLogo from "@/assets/sk-logo.jpg";
import { cn } from "@/lib/utils";

const links = [
  { id: "about", label: "About" },
  { id: "announcements", label: "News" },
  { id: "leaderboard", label: "Top 7" },
  { id: "candidates", label: "Candidates" },
  { id: "gallery", label: "Gallery" },
  { id: "videos", label: "Videos" },
  { id: "tickets", label: "Tickets" },
  { id: "sponsors", label: "Sponsors" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
        scrolled
          ? "bg-(--emerald-deep)/85 backdrop-blur-xl border-b border-(--gold)/25 py-2"
          : "bg-transparent py-4",
      )}
    >
      <div className="max-w-7xl mx-auto px-5 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-3 group">
          <img src={barangaySeal} alt="Barangay Lalo seal" className="h-9 w-9 rounded-full ring-1 ring-(--gold)/50" />
          <img src={skLogo} alt="SK Barangay Lalo" className="h-9 w-9 rounded-full ring-1 ring-(--gold)/50 hidden sm:block" />
          <div className="hidden md:block leading-tight">
            <div className="text-[10px] uppercase tracking-[0.32em] text-(--gold-soft)/80">SK Barangay Lalo</div>
            <div className="font-display text-sm text-gold-gradient">Mr. & Ms. Teen Lalo 2026</div>
          </div>
        </a>
        <nav className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className="text-xs uppercase tracking-[0.25em] text-(--ivory)/80 hover:text-(--gold-soft) transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-(--gold) after:transition-all hover:after:w-full"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <Link to="/auth" aria-label="Admin access" className="h-2 w-2 rounded-full bg-(--gold)/30 hover:bg-(--gold) transition-colors" />
      </div>
    </header>
  );
}
