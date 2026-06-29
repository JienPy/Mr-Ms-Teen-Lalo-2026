import { motion } from "framer-motion";
import coupleEmblem from "@/assets/couple-emblem.png";
import { Countdown } from "@/components/luxury/Countdown";
import { GoldButton } from "@/components/luxury/GoldButton";
import { GoldParticles } from "@/components/luxury/Particles";

export function Hero({ targetIso, venue, time }: { targetIso: string; venue: string; time: string }) {
  return (
    <section id="top" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 damask-overlay">
      <GoldParticles count={42} />

      {/* corner flourishes */}
      <CornerOrnament className="top-6 left-6" />
      <CornerOrnament className="top-6 right-6" flipX />
      <CornerOrnament className="bottom-6 left-6" flipY />
      <CornerOrnament className="bottom-6 right-6" flipX flipY />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-[260px] sm:w-[340px] md:w-[400px] animate-glow-pulse"
        >
          <img
            src={coupleEmblem}
            alt="Mr. & Ms. Teen Lalo 2026 emblem"
            width={1024}
            height={1024}
            className="w-full h-auto drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.18em" }}
          transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }}
          className="mt-8 text-[10px] sm:text-xs uppercase text-(--gold-soft)/70"
        >
          Sangguniang Kabataan · Barangay Lalo · City of Tayabas Presents
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="relative mt-4 font-display text-5xl sm:text-7xl md:text-8xl leading-[0.98] text-(--gold-soft)"
          style={{
            textShadow: "0 3px 0 rgba(6, 35, 31, 0.75), 0 18px 45px rgba(201, 162, 75, 0.22)",
          }}
        >
          <span className="relative inline-block">
            Mr. <span className="opacity-80">&amp;</span> Ms.
            <span className="block">Teen Lalo 2026</span>
            <span className="pointer-events-none absolute inset-0 animate-shimmer-sweep mix-blend-overlay" aria-hidden />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1 }}
          className="mt-6 font-serif italic text-lg sm:text-2xl text-(--ivory)/85 max-w-2xl mx-auto"
        >
          “Beyond Beauty and Confidence: Empowering the Youth of Barangay Lalo.”
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.3em] text-(--gold-soft)/90"
        >
          <span>August 30, 2026</span>
          <span className="text-(--gold)/60">·</span>
          <span>{venue}</span>
          <span className="text-(--gold)/60">·</span>
          <span>{time}</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-10"
        >
          <Countdown targetIso={targetIso} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-10 flex flex-wrap gap-4 justify-center"
        >
          <a href="#tickets"><GoldButton>Get Your Ticket</GoldButton></a>
          <a href="#candidates"><GoldButton variant="outline">Meet the Candidates</GoldButton></a>
        </motion.div>
      </div>
    </section>
  );
}

function CornerOrnament({ className = "", flipX, flipY }: { className?: string; flipX?: boolean; flipY?: boolean }) {
  const transform = `${flipX ? "scaleX(-1) " : ""}${flipY ? "scaleY(-1)" : ""}`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={`pointer-events-none absolute w-20 h-20 sm:w-28 sm:h-28 text-(--gold)/70 ${className}`}
      style={{ transform }}
    >
      <path
        d="M5 5 L40 5 M5 5 L5 40 M10 10 Q30 10 30 30 M10 10 Q10 30 30 30"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <circle cx="5" cy="5" r="2" fill="currentColor" />
      <circle cx="30" cy="30" r="1.5" fill="currentColor" />
    </svg>
  );
}
