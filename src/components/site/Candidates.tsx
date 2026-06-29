import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { candidatePhotosQuery, candidatesQuery } from "@/lib/queries";
import { mainPortraitFor, profileGalleryFor } from "@/lib/candidatePhotos";
import { Reveal } from "@/components/luxury/Reveal";

export function Candidates() {
  const { data } = useSuspenseQuery(candidatesQuery);
  const { data: candidatePhotos } = useSuspenseQuery(candidatePhotosQuery);
  const [tab, setTab] = useState<"mr" | "ms">("ms");
  const [open, setOpen] = useState<any | null>(null);
  const list = (data ?? []).filter((c: any) => c.division === tab);
  const openPortrait = open ? mainPortraitFor(open, candidatePhotos) : null;
  const openGallery = open ? profileGalleryFor(open, candidatePhotos) : [];

  return (
    <div>
      <Reveal>
        <div className="flex justify-center gap-2 mb-12">
          {(["ms", "mr"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-full text-xs uppercase tracking-[0.3em] transition-all ${
                tab === t
                  ? "bg-gold-gradient text-(--primary-foreground)"
                  : "border border-(--gold)/40 text-(--gold-soft)/70 hover:border-(--gold) hover:text-(--gold-soft)"
              }`}
            >
              {t === "ms" ? "Ms. Teen" : "Mr. Teen"}
            </button>
          ))}
        </div>
      </Reveal>

      {list.length === 0 ? (
        <p className="text-center text-(--ivory)/60 font-serif italic">
          Candidates will be revealed soon. Stay tuned.
        </p>
      ) : (
        <motion.div
          key={tab}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {list.map((c: any) => {
            const portrait = mainPortraitFor(c, candidatePhotos);
            return (
              <motion.div
                key={c.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
                }}
              >
                <button
                  onClick={() => setOpen(c)}
                  className="group block w-full text-left glass-emerald rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(201,162,75,0.45)] transition-all duration-500 ornate-border"
                >
                  <div className="relative m-3 aspect-[3/4] overflow-hidden rounded-lg border border-(--gold)/35 bg-(--emerald-deep)">
                    {portrait ? (
                      <img
                        src={portrait}
                        alt={c.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-(--emerald-mid) to-(--emerald-deep) grid place-items-center text-center px-5">
                        <div>
                          <Sparkles className="w-8 h-8 mx-auto text-(--gold)/70 mb-4" />
                          <div className="text-(--gold) font-display text-6xl">{c.name.charAt(0)}</div>
                          <div className="mt-3 text-[10px] uppercase tracking-[0.28em] text-(--ivory)/45">Photo soon</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-(--emerald-deep) via-transparent to-transparent" />
                    {c.candidate_number != null && (
                      <span className="absolute top-3 left-3 w-9 h-9 rounded-full bg-gold-gradient text-(--primary-foreground) grid place-items-center font-display text-sm">
                        {c.candidate_number}
                      </span>
                    )}
                  </div>
                  <div className="px-5 pb-5 text-center">
                    <div className="font-display text-lg text-gold-gradient">{c.name}</div>
                    {c.sitio && <div className="text-[10px] uppercase tracking-[0.3em] text-(--ivory)/60 mt-1">{c.sitio}</div>}
                    {(c.belief || c.motto) && (
                      <p className="mt-3 font-serif text-sm text-(--ivory)/78 leading-relaxed line-clamp-3">
                        {c.belief || c.motto}
                      </p>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md grid place-items-center p-4"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-emerald rounded-3xl max-w-4xl w-full overflow-hidden grid md:grid-cols-2"
            >
              <div className="bg-(--emerald-deep)">
                <div className="aspect-[3/4]">
                {openPortrait ? (
                  <img src={openPortrait} alt={open.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-(--gold) font-display text-8xl">{open.name.charAt(0)}</div>
                )}
                </div>
                {openGallery.length > 0 && (
                  <div className="p-3 grid grid-cols-3 gap-2 border-t border-(--gold)/15">
                    {openGallery.map((photo) => (
                      <img key={photo.id} src={photo.image_url} alt={photo.caption ?? open.name} className="aspect-square w-full rounded-md object-cover border border-(--gold)/20" />
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8 relative">
                <button
                  onClick={() => setOpen(null)}
                  className="absolute top-4 right-4 text-(--gold-soft)/70 hover:text-(--gold) transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-[10px] uppercase tracking-[0.4em] text-(--gold-soft)/70">
                  {open.division === "mr" ? "Mr. Teen" : "Ms. Teen"}{open.sitio ? ` · ${open.sitio}` : ""}
                </div>
                <h3 className="mt-2 font-display text-3xl text-gold-gradient">{open.name}</h3>
                {open.candidate_number != null && (
                  <div className="mt-1 text-xs text-(--ivory)/60">Candidate No. {open.candidate_number}</div>
                )}
                {(open.belief || open.motto) && (
                  <blockquote className="mt-8 relative font-serif italic text-xl text-(--ivory)/90 leading-relaxed">
                    <span className="absolute -left-3 -top-4 text-5xl text-(--gold)/70 font-display">“</span>
                    {open.belief || open.motto}
                    <span className="block text-right text-3xl text-(--gold)/70 font-display">”</span>
                  </blockquote>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
