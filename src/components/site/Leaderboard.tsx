import { useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { candidatePhotosQuery, leaderboardQuery } from "@/lib/queries";
import { top7ImageFor, top7PhotosFor } from "@/lib/candidatePhotos";
import { Reveal } from "@/components/luxury/Reveal";

function CountUp({ to }: { to: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="tabular-nums"
    >
      <motion.span
        initial={{ "--n": 0 } as any}
        whileInView={{ "--n": to } as any}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        // @ts-ignore
        style={{ counterReset: "n var(--n)" }}
      >
        {to.toFixed(2)}
      </motion.span>
    </motion.span>
  );
}

function Avatar({ candidate, image, size = "md" }: { candidate: any; image?: string | null; size?: "sm" | "md" | "lg" }) {
  const classes = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  }[size];

  if (image) {
    return <img src={image} alt={candidate.name} className={`${classes} rounded-full object-cover ring-1 ring-(--gold)/40`} />;
  }

  return (
    <div className={`${classes} rounded-full bg-(--secondary) grid place-items-center text-(--gold) font-display`}>
      {candidate.name.charAt(0)}
    </div>
  );
}

export function Leaderboard() {
  const { data } = useSuspenseQuery(leaderboardQuery);
  const { data: candidatePhotos } = useSuspenseQuery(candidatePhotosQuery);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const topCandidate = data?.[0];
  const topShowcase = topCandidate ? top7PhotosFor(topCandidate, candidatePhotos) : [];

  useEffect(() => {
    setShowcaseIndex(0);
  }, [topCandidate?.candidate_id]);

  useEffect(() => {
    if (topShowcase.length <= 1) return;
    const timer = window.setInterval(() => {
      setShowcaseIndex((index) => (index + 1) % topShowcase.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [topShowcase.length]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-(--ivory)/60 font-serif italic">
        Weekly standings will appear here once tickets are encoded.
      </div>
    );
  }

  const top = data[0];
  const second = data[1];
  const topSeven = data.slice(2, 7);
  const remaining = data.slice(7);
  const topImage = topShowcase.length > 0 ? topShowcase[showcaseIndex % topShowcase.length]?.image_url : top7ImageFor(top, candidatePhotos);

  return (
    <div>
      <div className="text-center mb-8 text-[11px] uppercase tracking-[0.35em] text-(--gold-soft)/80">
        Week of {top.week_start} - {top.week_end}
      </div>

      <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
        <Reveal>
          <div className="glass-emerald rounded-2xl p-6 lg:p-8 relative overflow-hidden ornate-border min-h-[430px]">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-(--gold)/20 blur-3xl" />
            <div className="grid md:grid-cols-[0.92fr_1.08fr] gap-6 items-stretch relative z-10">
              <div className="relative min-h-[300px] rounded-xl border border-(--gold)/25 overflow-hidden bg-(--emerald-deep)">
                {topImage ? (
                  <motion.img
                    key={topImage}
                    src={topImage}
                    alt={top.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7 }}
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-(--secondary)">
                    <span className="font-display text-7xl text-(--gold)">{top.name.charAt(0)}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-(--emerald-deep) via-transparent to-transparent" />
                {topShowcase.length > 1 && (
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                    {topShowcase.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => setShowcaseIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${index === showcaseIndex % topShowcase.length ? "w-8 bg-(--gold)" : "w-3 bg-(--ivory)/35"}`}
                        aria-label={`Show photo ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 text-(--gold)">
                    <Crown className="w-5 h-5" />
                    <span className="text-xs uppercase tracking-[0.3em]">Rank 1 · Leading</span>
                  </div>
                  <div className="mt-8">
                    <div className="font-display text-3xl lg:text-4xl text-gold-gradient">{top.name}</div>
                    <div className="text-xs uppercase tracking-[0.3em] text-(--ivory)/60 mt-2">
                      {top.division === "mr" ? "Mr. Teen" : "Ms. Teen"}{top.sitio ? ` · ${top.sitio}` : ""}
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <div className="flex items-baseline justify-between gap-5">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/70">Ticket sales share</span>
                    <span className="font-display text-4xl lg:text-5xl text-gold-gradient"><CountUp to={Number(top.percentage)} />%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-(--emerald-deep) overflow-hidden">
                    <motion.div
                      className="h-full bg-gold-gradient"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${top.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="space-y-3">
          {second && (
            <Reveal>
              <div className="glass-emerald rounded-2xl p-5 flex items-center gap-4 hover:translate-x-1 transition-transform border border-(--gold)/25">
                <div className="w-12 h-12 grid place-items-center rounded-full bg-gold-gradient text-(--primary-foreground) font-display text-xl">2</div>
                <Avatar candidate={second} image={top7ImageFor(second, candidatePhotos)} />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-2xl text-(--ivory) truncate">{second.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-(--ivory)/50 truncate">
                    {second.division === "mr" ? "Mr. Teen" : "Ms. Teen"}{second.sitio ? ` · ${second.sitio}` : ""}
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-(--emerald-deep) overflow-hidden">
                    <motion.div
                      className="h-full bg-gold-gradient"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${second.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.1 }}
                    />
                  </div>
                </div>
                <div className="font-display text-2xl text-gold-gradient tabular-nums w-20 text-right">
                  {Number(second.percentage).toFixed(2)}%
                </div>
              </div>
            </Reveal>
          )}

          {topSeven.map((c: any, i: number) => (
            <Reveal key={c.candidate_id} delay={i * 0.05}>
              <div className="glass-emerald rounded-xl p-4 flex items-center gap-4 hover:translate-x-1 transition-transform">
                <div className="w-10 h-10 grid place-items-center rounded-full bg-(--emerald-deep) text-(--gold-soft) font-display text-lg ring-1 ring-(--gold)/40">
                  {c.rank}
                </div>
                <Avatar candidate={c} image={top7ImageFor(c, candidatePhotos)} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-lg text-(--ivory) truncate">{c.name}</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-(--ivory)/50 truncate">
                    {c.division === "mr" ? "Mr. Teen" : "Ms. Teen"}{c.sitio ? ` · ${c.sitio}` : ""}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-(--emerald-deep) overflow-hidden">
                    <motion.div
                      className="h-full bg-gold-gradient"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.1 + i * 0.05 }}
                    />
                  </div>
                </div>
                <div className="font-display text-xl text-gold-gradient tabular-nums w-16 text-right">
                  {Number(c.percentage).toFixed(2)}%
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {remaining.length > 0 && (
        <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {remaining.map((c: any) => (
            <div key={c.candidate_id} className="glass-emerald rounded-lg px-3 py-2 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-(--emerald-deep) text-(--gold-soft) grid place-items-center font-display text-xs ring-1 ring-(--gold)/25">
                {c.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-(--ivory)/90 truncate">{c.name}</div>
                <div className="h-1 mt-1 bg-(--emerald-deep) rounded-full overflow-hidden">
                  <div className="h-full bg-(--gold)/70" style={{ width: `${Number(c.percentage)}%` }} />
                </div>
              </div>
              <span className="text-xs tabular-nums text-(--gold-soft)">{Number(c.percentage).toFixed(2)}%</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-center mt-10 text-xs text-(--ivory)/50 font-serif italic">
        Standings update weekly. Percentages reflect public share only; ticket counts remain private.
      </p>
    </div>
  );
}
