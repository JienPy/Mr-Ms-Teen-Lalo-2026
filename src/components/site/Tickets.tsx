import { motion } from "framer-motion";
import { Reveal } from "@/components/luxury/Reveal";
import officialTicket from "@/assets/ticket-regular.png";

export function Tickets({
  price,
  terms,
  ticketImage,
}: {
  price: number;
  terms: string[];
  ticketImage?: string | null;
}) {
  const displayTicket = ticketImage || officialTicket;

  return (
    <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-12 items-center">
      <Reveal>
        <motion.div
          whileHover={{ rotateY: 8, rotateX: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative mx-auto w-full max-w-4xl aspect-[2048/899] rounded-xl ornate-border overflow-hidden glass-emerald shadow-[0_35px_100px_-40px_rgba(201,162,75,0.7)]"
          style={{ transformStyle: "preserve-3d", perspective: 1000 }}
        >
          <img src={displayTicket} alt="Official ticket" className="w-full h-full object-cover" />
        </motion.div>
      </Reveal>

      <Reveal delay={0.15}>
        <div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-(--gold-soft)/70">Official Pageant Ticket</div>
          <h3 className="font-display text-3xl text-gold-gradient mt-2">₱{price} · Admit One</h3>
          <p className="mt-4 font-serif text-(--ivory)/85 text-lg">
            Tickets are available through any official candidate. Support a candidate and secure your seat for the gala night.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-(--ivory)/75">
            {terms.map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-(--gold) mt-1">✦</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}
