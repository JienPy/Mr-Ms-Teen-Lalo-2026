import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X } from "lucide-react";
import { videosQuery } from "@/lib/queries";
import { Reveal } from "@/components/luxury/Reveal";
import { ShowcaseCarousel } from "@/components/site/ShowcaseCarousel";

function getEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube") || u.hostname === "youtu.be") {
      const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
    if (u.hostname.includes("facebook")) {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&autoplay=true`;
    }
    if (u.hostname.includes("tiktok")) return url;
  } catch {}
  return null;
}

export function Videos() {
  const { data } = useSuspenseQuery(videosQuery);
  const [open, setOpen] = useState<any | null>(null);
  const videos = data ?? [];

  if (videos.length === 0) {
    return <p className="text-center text-(--ivory)/60 font-serif italic">Teasers and reels will be posted here.</p>;
  }

  return (
    <>
      <ShowcaseCarousel ariaLabel="Videos carousel" className="max-w-7xl mx-auto">
        {videos.map((v: any, i: number) => (
          <Reveal key={v.id} delay={i * 0.06}>
            <button
              onClick={() => setOpen(v)}
              className="group block w-full text-left glass-emerald rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform"
            >
              <div className="relative aspect-video bg-(--emerald-deep)">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-(--emerald-mid) to-(--emerald-deep)" />
                )}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-16 h-16 rounded-full bg-gold-gradient grid place-items-center shadow-[0_10px_40px_rgba(201,162,75,0.5)] group-hover:scale-110 transition">
                    <Play className="w-7 h-7 text-(--primary-foreground) translate-x-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="font-display text-lg text-gold-gradient">{v.title}</div>
                {v.tag && <div className="text-[10px] uppercase tracking-[0.3em] text-(--ivory)/50 mt-1">{v.tag}</div>}
              </div>
            </button>
          </Reveal>
        ))}
      </ShowcaseCarousel>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 grid place-items-center p-4"
            onClick={() => setOpen(null)}
          >
            <button onClick={() => setOpen(null)} aria-label="Close" className="absolute top-4 right-4 text-(--gold-soft)">
              <X className="w-7 h-7" />
            </button>
            <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden ornate-border" onClick={(e) => e.stopPropagation()}>
              {open.source_type === "upload" ? (
                <video src={open.url} controls autoPlay className="w-full h-full" />
              ) : (
                (() => {
                  const embed = getEmbed(open.url);
                  return embed ? (
                    <iframe src={embed} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-(--ivory)/70">
                      <a href={open.url} target="_blank" rel="noreferrer" className="underline">Open video in new tab</a>
                    </div>
                  );
                })()
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
