import { useSuspenseQuery } from "@tanstack/react-query";
import { Megaphone, Pin } from "lucide-react";
import { announcementsQuery } from "@/lib/queries";
import { Reveal } from "@/components/luxury/Reveal";
import { ShowcaseCarousel } from "@/components/site/ShowcaseCarousel";

export function Announcements() {
  const { data } = useSuspenseQuery(announcementsQuery);
  const list = data ?? [];
  if (list.length === 0) {
    return <p className="text-center text-(--ivory)/60 font-serif italic">No announcements yet. Check back soon.</p>;
  }
  return (
    <ShowcaseCarousel ariaLabel="Announcements carousel" className="max-w-7xl mx-auto">
      {list.map((a: any, i: number) => (
        <Reveal key={a.id} delay={i * 0.05}>
          <article className={`min-h-[20rem] glass-emerald rounded-xl p-5 md:p-6 ${a.is_pinned ? "ring-1 ring-(--gold)" : ""}`}>
            <div className="grid md:grid-cols-[auto_1fr] gap-4 items-start">
              <div className="w-11 h-11 rounded-full bg-gold-gradient text-(--primary-foreground) grid place-items-center shrink-0">
                {a.is_pinned ? <Pin className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/70 mb-2">
                  <time>{new Date(a.published_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</time>
                </div>
                <h3 className="font-display text-2xl text-gold-gradient">{a.title}</h3>
                {a.image_url && <img src={a.image_url} alt="" loading="lazy" className="mt-4 rounded-xl w-full ornate-border" />}
                <p className="mt-3 font-serif text-(--ivory)/85 whitespace-pre-line leading-relaxed">{a.body}</p>
              </div>
            </div>
          </article>
        </Reveal>
      ))}
    </ShowcaseCarousel>
  );
}
