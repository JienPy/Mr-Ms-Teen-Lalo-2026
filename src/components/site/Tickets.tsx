import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Facebook, X } from "lucide-react";
import { Reveal } from "@/components/luxury/Reveal";
import { candidatesQuery } from "@/lib/queries";
import officialTicket from "@/assets/ticket-regular.png";

function TicketWatermark() {
  const marks = Array.from({ length: 36 });

  return (
    <div className="pointer-events-none absolute inset-0 z-[50] overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-[-38%] grid grid-cols-4 gap-x-4 gap-y-7 -rotate-12">
        {marks.map((_, index) => (
          <div
            key={index}
            className="whitespace-nowrap text-center font-black uppercase tracking-[0.22em] text-[clamp(0.56rem,1.35vw,1rem)]"
            style={{
              color: "rgba(255,255,255,0.62)",
              textShadow: "0 2px 3px rgba(0,0,0,0.95), 0 0 12px rgba(201,162,75,0.45)",
            }}
          >
            No Copy · Preview Only
          </div>
        ))}
      </div>
      <div
        className="absolute left-1/2 top-1/2 w-[72%] -translate-x-1/2 -translate-y-1/2 -rotate-12 rounded-full border-2 border-white/65 bg-black/45 px-4 py-3 text-center text-[clamp(0.75rem,2.1vw,1.65rem)] font-black uppercase tracking-[0.26em] text-white shadow-[0_0_30px_rgba(0,0,0,0.75)] backdrop-blur-[1px]"
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
      >
        No Copy · Sample Only
      </div>
      <div className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full border border-(--gold)/80 bg-black/75 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.24em] text-(--gold-soft) shadow-lg backdrop-blur-sm sm:bottom-5 sm:text-[10px]">
        Watermarked Preview · Not Valid for Entry
      </div>
    </div>
  );
}

function ContactRow({ person, label }: { person: any; label: string }) {
  return (
    <div className="rounded-xl border border-(--gold)/15 bg-(--emerald-deep)/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-display text-xl text-(--ivory)">{person.name}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-(--gold-soft)/65">{label}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {person.facebook_url && (
          <a
            href={person.facebook_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-(--gold)/25 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-(--gold-soft) hover:text-(--gold)"
          >
            <Facebook className="w-4 h-4" /> Facebook
          </a>
        )}
      </div>
    </div>
  );
}

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
  const { data: candidates = [] } = useSuspenseQuery(candidatesQuery);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-12 items-center">
        <Reveal>
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            onContextMenu={(event) => event.preventDefault()}
            onCopy={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
            whileHover={{ rotateY: 8, rotateX: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative mx-auto w-full max-w-4xl aspect-[2048/899] select-none rounded-xl ornate-border overflow-hidden glass-emerald shadow-[0_35px_100px_-40px_rgba(201,162,75,0.7)]"
            style={{ transformStyle: "preserve-3d", perspective: 1000, WebkitUserSelect: "none" }}
            aria-label="View ticket sellers"
          >
            <img
              src={displayTicket}
              alt="Official ticket"
              draggable={false}
              className="pointer-events-none h-full w-full select-none object-cover"
              style={{ WebkitUserDrag: "none", WebkitTouchCallout: "none" }}
            />
            <TicketWatermark />
          </motion.button>
        </Reveal>

        <Reveal delay={0.15}>
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-(--gold-soft)/70">Official Pageant Ticket</div>
            <h3 className="font-display text-3xl text-gold-gradient mt-2">₱{price} · Admit One</h3>
            <p className="mt-4 font-serif text-(--ivory)/85 text-lg">
              Tickets are available through any official candidate. Tap the ticket to choose who to message.
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

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md p-4 overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="glass-emerald rounded-2xl max-w-5xl mx-auto my-8 p-5 sm:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-(--gold-soft)/70">Ticket Availability</div>
                <h3 className="font-display text-3xl text-gold-gradient mt-2">Choose a Candidate</h3>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-(--gold-soft) hover:text-(--gold)">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-3">
              {candidates.map((candidate: any) => (
                <ContactRow
                  key={candidate.id}
                  person={candidate}
                  label={`${candidate.division === "mr" ? "Mr. Teen" : "Ms. Teen"}${candidate.sitio ? ` · ${candidate.sitio}` : ""}`}
                />
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
