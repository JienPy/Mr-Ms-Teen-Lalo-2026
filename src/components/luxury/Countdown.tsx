import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

function Cell({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="glass-emerald rounded-xl px-4 py-3 min-w-[72px] sm:min-w-[88px] text-center relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={v}
            initial={{ y: -22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 22, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-5xl font-display text-gold-gradient tabular-nums"
          >
            {v}
          </motion.div>
        </AnimatePresence>
      </div>
      <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-(--gold-soft)/80">{label}</span>
    </div>
  );
}

export function Countdown({ targetIso }: { targetIso: string }) {
  const target = new Date(targetIso);
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    setT(diff(target));
    const i = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(i);
  }, [targetIso]);
  return (
    <div className="flex items-center gap-3 sm:gap-5 justify-center">
      <Cell value={t.days} label="Days" />
      <Cell value={t.hours} label="Hours" />
      <Cell value={t.minutes} label="Minutes" />
      <Cell value={t.seconds} label="Seconds" />
    </div>
  );
}
