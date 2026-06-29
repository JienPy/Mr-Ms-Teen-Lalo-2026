import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { albumsQuery } from "@/lib/queries";
import { Reveal } from "@/components/luxury/Reveal";
import { ShowcaseCarousel } from "@/components/site/ShowcaseCarousel";

export function Gallery() {
  const { data } = useSuspenseQuery(albumsQuery);
  const [lightbox, setLightbox] = useState<{ photos: any[]; index: number } | null>(null);
  const albums = data ?? [];

  if (albums.length === 0) {
    return <p className="text-center text-(--ivory)/60 font-serif italic">Albums will appear here as the journey unfolds.</p>;
  }

  return (
    <>
      <ShowcaseCarousel ariaLabel="Gallery albums carousel" className="max-w-7xl mx-auto">
        {albums.map((a: any, albumIndex: number) => {
          const photos = [...(a.photos ?? [])].sort((p: any, q: any) => p.sort_order - q.sort_order);
          const heroImage = photos[0]?.image_url ?? a.cover_url;

          return (
            <Reveal key={a.id} delay={albumIndex * 0.05}>
              <article className="glass-emerald rounded-2xl p-5 md:p-6 h-full">
                <div className="mb-4">
                  <div className="text-[10px] uppercase tracking-[0.35em] text-(--gold-soft)/70">
                    {a.type === "past" ? "Past Event" : "Upcoming"}
                  </div>
                  <h3 className="font-display text-3xl text-gold-gradient mt-1">{a.title}</h3>
                  {a.description && (
                    <p className="mt-2 font-serif text-(--ivory)/75 leading-relaxed line-clamp-2">{a.description}</p>
                  )}
                </div>

                {heroImage ? (
                  <button
                    onClick={() => photos.length && setLightbox({ photos, index: 0 })}
                    className="group block w-full overflow-hidden rounded-xl ornate-border bg-(--emerald-deep)"
                  >
                    <img
                      src={heroImage}
                      alt={a.title}
                      loading="lazy"
                      className="w-full aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </button>
                ) : (
                  <div className="w-full aspect-[16/9] rounded-xl ornate-border bg-(--emerald-deep) grid place-items-center text-(--ivory)/45 font-serif italic">
                    No photos yet.
                  </div>
                )}

                {photos.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {photos.slice(0, 4).map((p: any, i: number) => (
                      <button
                        key={p.id}
                        onClick={() => setLightbox({ photos, index: i })}
                        className="overflow-hidden rounded-lg border border-(--gold)/20 bg-(--emerald-deep)"
                      >
                        <img src={p.image_url} alt={p.caption ?? ""} loading="lazy" className="w-full aspect-square object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
      </ShowcaseCarousel>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 grid place-items-center"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 text-(--gold-soft)"
              onClick={() => setLightbox(null)}
              aria-label="Close"
            >
              <X className="w-7 h-7" />
            </button>
            <button
              className="absolute left-4 text-(--gold-soft)"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((l) => l && { ...l, index: (l.index - 1 + l.photos.length) % l.photos.length });
              }}
              aria-label="Previous"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <img
              src={lightbox.photos[lightbox.index].image_url}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 text-(--gold-soft)"
              onClick={(e) => {
                e.stopPropagation();
                setLightbox((l) => l && { ...l, index: (l.index + 1) % l.photos.length });
              }}
              aria-label="Next"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
