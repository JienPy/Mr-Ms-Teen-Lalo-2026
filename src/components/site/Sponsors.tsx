import { useSuspenseQuery } from "@tanstack/react-query";
import { Building2, ExternalLink, Sparkles } from "lucide-react";
import { sponsorsQuery } from "@/lib/queries";
import { Reveal } from "@/components/luxury/Reveal";
import { Section } from "@/components/site/Section";

const tiers = [
  { id: "major", label: "Major Sponsors", size: "lg:grid-cols-3", logo: "h-44" },
  { id: "partner", label: "Official Partners", size: "lg:grid-cols-4", logo: "h-36" },
  { id: "community", label: "Community Supporters", size: "lg:grid-cols-4", logo: "h-32" },
];

export function Sponsors() {
  const { data } = useSuspenseQuery(sponsorsQuery);
  const sponsors = data ?? [];

  if (sponsors.length === 0) return null;

  return (
    <Section id="sponsors" eyebrow="With Gratitude" title="Sponsors & Partners">
      <div className="space-y-10">
        {tiers.map((tier) => {
          const list = sponsors.filter((s: any) => s.tier === tier.id);
          if (list.length === 0) return null;

          return (
            <Reveal key={tier.id}>
              <div>
                <div className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.35em] text-(--gold-soft)/75 mb-5">
                  <Sparkles className="w-4 h-4 text-(--gold)" />
                  <span>{tier.label}</span>
                </div>
                <div className={`grid sm:grid-cols-2 ${tier.size} gap-4`}>
                  {list.map((s: any) => {
                    const content = (
                      <article className="h-full glass-emerald rounded-xl p-4 text-center hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(201,162,75,0.45)] transition-all duration-500">
                        <div className={`${tier.logo} rounded-lg border border-(--gold)/20 bg-(--emerald-deep)/70 grid place-items-center overflow-hidden p-4`}>
                          {s.logo_url ? (
                            <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                          ) : (
                            <Building2 className="w-10 h-10 text-(--gold-soft)/65" />
                          )}
                        </div>
                        <h3 className="mt-4 font-display text-xl text-(--gold-soft)">{s.name}</h3>
                        {s.description && (
                          <p className="mt-1.5 font-serif text-sm text-(--ivory)/75 leading-relaxed">{s.description}</p>
                        )}
                        {s.link_url && (
                          <div className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-(--gold-soft)/70">
                            Visit <ExternalLink className="w-3 h-3" />
                          </div>
                        )}
                      </article>
                    );

                    return s.link_url ? (
                      <a key={s.id} href={s.link_url} target="_blank" rel="noreferrer" className="block">
                        {content}
                      </a>
                    ) : (
                      <div key={s.id}>{content}</div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
