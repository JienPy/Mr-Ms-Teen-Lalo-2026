import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { candidatePhotosQuery, candidatesQuery } from "@/lib/queries";
import { mainPortraitFor, profileGalleryFor } from "@/lib/candidatePhotos";
import { Reveal } from "@/components/luxury/Reveal";

const candidateGridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
};

const candidateCardVariants = {
  hidden: { opacity: 0, y: 36, scale: 0.96, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
};

const portraitVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.065, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

export function Candidates() {
  const { data } = useSuspenseQuery(candidatesQuery);
  const { data: candidatePhotos } = useSuspenseQuery(candidatePhotosQuery);
  const [tab, setTab] = useState<"mr" | "ms">("ms");
  const [open, setOpen] = useState<any | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<any | null>(null);
  const list = (data ?? []).filter((c: any) => c.division === tab);
  const openPortrait = open ? mainPortraitFor(open, candidatePhotos) : null;
  const openGallery = open ? profileGalleryFor(open, candidatePhotos) : [];

  return (
    <div>
      <Reveal>
        <div className="flex justify-center gap-2 mb-12">
          {(["ms", "mr"] as const).map((t) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              whileTap={{ scale: 0.96 }}
              className={`px-6 py-2 rounded-full text-xs uppercase tracking-[0.3em] transition-all ${
                tab === t
                  ? "bg-gold-gradient text-(--primary-foreground)"
                  : "border border-(--gold)/40 text-(--gold-soft)/70 hover:border-(--gold) hover:text-(--gold-soft)"
              }`}
            >
              {t === "ms" ? "Ms. Teen" : "Mr. Teen"}
            </motion.button>
          ))}
        </div>
      </Reveal>

      {list.length === 0 ? (
        <p className="text-center text-(--ivory)/60 font-serif italic">
          Candidates will be revealed soon. Stay tuned.
        </p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-[min(580px,80vw)] -translate-x-1/2 rounded-full bg-(--gold)/10 blur-3xl" />
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial="hidden"
              animate="show"
              exit="exit"
              variants={candidateGridVariants}
            >
              {list.map((c: any) => {
                const portrait = mainPortraitFor(c, candidatePhotos);
                return (
                  <motion.div
                    key={c.id}
                    variants={candidateCardVariants}
                    layout
                    whileHover="hover"
                    initial="rest"
                    animate="rest"
                  >
                    <motion.button
                      onClick={() => {
                        setPreviewPhoto(null);
                        setOpen(c);
                      }}
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="candidate-card group block w-full text-left glass-emerald rounded-xl overflow-hidden ornate-border focus:outline-none focus-visible:ring-2 focus-visible:ring-(--gold)"
                    >
                      <div className="candidate-card__halo" />
                      <div className="relative m-3 aspect-[3/4] overflow-hidden rounded-lg border border-(--gold)/35 bg-(--emerald-deep)">
                        <div className="candidate-card__corner candidate-card__corner--tl" />
                        <div className="candidate-card__corner candidate-card__corner--br" />
                        <div className="candidate-card__spark candidate-card__spark--one" />
                        <div className="candidate-card__spark candidate-card__spark--two" />
                        {portrait ? (
                          <motion.img
                            src={portrait}
                            alt={c.name}
                            className="w-full h-full object-cover object-[center_28%]"
                            variants={portraitVariants}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-(--emerald-mid) to-(--emerald-deep) grid place-items-center text-center px-5">
                            <div>
                              <motion.div
                                animate={{ rotate: [0, 6, 0, -6, 0], scale: [1, 1.08, 1] }}
                                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                              >
                                <Sparkles className="w-8 h-8 mx-auto text-(--gold)/70 mb-4" />
                              </motion.div>
                              <div className="text-(--gold) font-display text-6xl">{c.name.charAt(0)}</div>
                              <div className="mt-3 text-[10px] uppercase tracking-[0.28em] text-(--ivory)/45">Photo soon</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-(--emerald-deep) via-transparent to-transparent" />
                        <div className="candidate-card__shine" />
                        {c.candidate_number != null && (
                          <motion.span
                            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-gold-gradient text-(--primary-foreground) grid place-items-center font-display text-sm shadow-[0_8px_24px_rgba(201,162,75,0.25)]"
                            whileHover={{ rotate: 8, scale: 1.08 }}
                          >
                            {c.candidate_number}
                          </motion.span>
                        )}
                      </div>
                      <div className="relative px-5 pb-5 text-center">
                        <motion.div
                          className="font-display text-lg text-gold-gradient"
                          variants={{
                            rest: { y: 0 },
                            hover: { y: -2, transition: { duration: 0.35 } },
                          }}
                        >
                          {c.name}
                        </motion.div>
                        {c.sitio && <div className="text-[10px] uppercase tracking-[0.3em] text-(--ivory)/60 mt-1">{c.sitio}</div>}
                        {(c.belief || c.motto) && (
                          <p className="mt-3 font-serif text-sm text-(--ivory)/78 leading-relaxed line-clamp-3">
                            {c.belief || c.motto}
                          </p>
                        )}
                        <div className="candidate-card__underline" />
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md grid place-items-center p-4"
            onClick={() => {
              setPreviewPhoto(null);
              setOpen(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass-emerald rounded-3xl max-w-4xl w-full overflow-hidden grid md:grid-cols-2 relative"
            >
              <div className="candidate-modal__glow" />
              <div className="bg-(--emerald-deep)">
                <div className="aspect-[3/4]">
                {openPortrait ? (
                  <motion.img
                    src={openPortrait}
                    alt={open.name}
                    className="w-full h-full object-cover object-[center_28%]"
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-(--gold) font-display text-8xl">{open.name.charAt(0)}</div>
                )}
                </div>
                {openGallery.length > 0 && (
                  <div className="p-3 grid grid-cols-3 gap-2 border-t border-(--gold)/15">
                    {openGallery.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewPhoto(photo);
                        }}
                        className="group overflow-hidden rounded-md border border-(--gold)/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--gold)"
                        aria-label={`View ${photo.caption ?? open.name} photo larger`}
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption ?? open.name}
                          className="aspect-square w-full object-cover object-[center_28%] transition-transform duration-500 group-hover:scale-105"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-8 relative">
                <button
                  onClick={() => {
                    setPreviewPhoto(null);
                    setOpen(null);
                  }}
                  className="absolute top-4 right-4 text-(--gold-soft)/70 hover:text-(--gold) transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
                <motion.div
                  className="text-[10px] uppercase tracking-[0.4em] text-(--gold-soft)/70"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  {open.division === "mr" ? "Mr. Teen" : "Ms. Teen"}{open.sitio ? ` · ${open.sitio}` : ""}
                </motion.div>
                <motion.h3
                  className="mt-2 font-display text-3xl text-gold-gradient"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                >
                  {open.name}
                </motion.h3>
                {open.candidate_number != null && (
                  <div className="mt-1 text-xs text-(--ivory)/60">Candidate No. {open.candidate_number}</div>
                )}
                {(open.belief || open.motto) && (
                  <motion.blockquote
                    className="mt-8 relative font-serif italic text-xl text-(--ivory)/90 leading-relaxed"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <span className="absolute -left-3 -top-4 text-5xl text-(--gold)/70 font-display">“</span>
                    {open.belief || open.motto}
                    <span className="block text-right text-3xl text-(--gold)/70 font-display">”</span>
                  </motion.blockquote>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md grid place-items-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 text-(--gold-soft)/80 hover:text-(--gold) transition-colors"
              aria-label="Close photo preview"
            >
              <X className="w-7 h-7" />
            </button>
            <motion.img
              src={previewPhoto.image_url}
              alt={previewPhoto.caption ?? open?.name ?? "Candidate photo"}
              className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain ornate-border shadow-[0_30px_100px_-30px_rgba(201,162,75,0.65)]"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            />
            {previewPhoto.caption && (
              <div className="absolute bottom-5 max-w-[90vw] rounded-full border border-(--gold)/25 bg-(--emerald-deep)/80 px-4 py-2 text-center font-serif text-sm text-(--ivory)/80">
                {previewPhoto.caption}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
