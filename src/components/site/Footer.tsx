import { Link } from "@tanstack/react-router";
import barangaySeal from "@/assets/barangay-seal.jpg";
import skLogo from "@/assets/sk-logo.jpg";
import { Facebook, Instagram, LockKeyhole } from "lucide-react";

type DeveloperContact = {
  is_visible?: boolean;
  label?: string;
  name?: string;
  email?: string;
  phone?: string;
  facebook?: string;
};

export function Footer({
  socials,
  developer,
}: {
  socials: { facebook?: string; instagram?: string; tiktok?: string };
  developer?: DeveloperContact;
}) {
  const showDeveloper = developer?.is_visible !== false && (developer?.name || developer?.email || developer?.phone || developer?.facebook);

  return (
    <footer className="relative mt-20 border-t border-(--gold)/20 bg-(--emerald-deep)/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 py-14 grid md:grid-cols-3 gap-10 items-center text-center md:text-left">
        <div className="flex items-center gap-4 justify-center md:justify-start">
          <img src={barangaySeal} alt="Barangay Lalo" className="h-16 w-16 rounded-full ring-1 ring-(--gold)/40" />
          <img src={skLogo} alt="SK Barangay Lalo" className="h-16 w-16 rounded-full ring-1 ring-(--gold)/40" />
        </div>
        <div>
          <div className="font-display text-xl text-gold-gradient">Mister & Miss Teen Lalo 2026</div>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-(--gold-soft)/70">
            Presented by Sangguniang Kabataan
          </p>
          <p className="text-xs text-(--ivory)/60">Barangay Lalo · City of Tayabas</p>
        </div>
        <div className="space-y-4 text-center md:text-right">
          <div className="flex items-center gap-4 justify-center md:justify-end">
            {socials.facebook && (
              <a href={socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-(--gold-soft)/80 hover:text-(--gold)">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {socials.instagram && (
              <a href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-(--gold-soft)/80 hover:text-(--gold)">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {socials.tiktok && (
              <a href={socials.tiktok} target="_blank" rel="noreferrer" className="text-(--gold-soft)/80 hover:text-(--gold) text-xs uppercase tracking-[0.2em]">
                TikTok
              </a>
            )}
          </div>
          {showDeveloper && (
            <div className="text-xs text-(--ivory)/55 leading-relaxed">
              <div className="uppercase tracking-[0.22em] text-(--gold-soft)/60">{developer?.label || "Website by"}</div>
              <div className="font-serif text-(--ivory)/80">{developer?.name}</div>
              <div className="flex flex-wrap justify-center md:justify-end gap-x-3 gap-y-1">
                {developer?.email && <a href={`mailto:${developer.email}`} className="hover:text-(--gold-soft)">{developer.email}</a>}
                {developer?.phone && <a href={`tel:${developer.phone}`} className="hover:text-(--gold-soft)">{developer.phone}</a>}
                {developer?.facebook && <a href={developer.facebook} target="_blank" rel="noreferrer" className="hover:text-(--gold-soft)">Facebook</a>}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-(--gold)/15 py-4 text-center text-[10px] uppercase tracking-[0.3em] text-(--ivory)/40 flex items-center justify-center gap-3">
        <span>© {new Date().getFullYear()} SK Barangay Lalo</span>
        <Link to="/auth" aria-label="Admin access" className="text-(--ivory)/25 hover:text-(--gold-soft) transition-colors">
          <LockKeyhole className="w-3.5 h-3.5" />
        </Link>
      </div>
    </footer>
  );
}
