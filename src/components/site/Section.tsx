import { Reveal } from "@/components/luxury/Reveal";
import { GoldDivider } from "@/components/luxury/GoldDivider";

export function Section({
  id,
  eyebrow,
  title,
  descriptor,
  subtitle,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  descriptor?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative py-20 sm:py-28 px-5 ${className ?? ""}`}>
      <div className="max-w-7xl mx-auto">
        {(eyebrow || title) && (
          <Reveal>
            <div className="text-center mb-14">
              {eyebrow && (
                <div className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-(--gold-soft)/80">{eyebrow}</div>
              )}
              {title && (
                <h2 className="mt-3 font-display text-3xl sm:text-5xl text-gold-gradient">{title}</h2>
              )}
              {descriptor && (
                <div className="mt-4 text-[10px] sm:text-xs uppercase tracking-[0.35em] text-(--gold-soft)">
                  {descriptor}
                </div>
              )}
              {subtitle && (
                <p className="mt-4 font-serif italic text-(--ivory)/75 max-w-2xl mx-auto text-lg">{subtitle}</p>
              )}
              <GoldDivider />
            </div>
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
