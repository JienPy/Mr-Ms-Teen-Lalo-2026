import { Children, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ShowcaseCarouselProps = {
  children: React.ReactNode;
  ariaLabel: string;
  className?: string;
  itemClassName?: string;
};

export function ShowcaseCarousel({ children, ariaLabel, className, itemClassName }: ShowcaseCarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);
  const scrollFrame = useRef<number | null>(null);

  function scrollToIndex(index: number) {
    const next = (index + items.length) % items.length;
    itemRefs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActive(next);
  }

  function updateActive() {
    if (scrollFrame.current) window.cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = window.requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const itemCenter = item.offsetLeft + item.clientWidth / 2;
        const distance = Math.abs(center - itemCenter);
        if (distance < closestDistance) {
          closest = index;
          closestDistance = distance;
        }
      });

      setActive(closest);
    });
  }

  if (items.length === 0) return null;

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        onScroll={updateActive}
        aria-label={ariaLabel}
        className="scrollbar-hidden flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[calc(50%-10rem)] sm:px-[calc(50%-15rem)] lg:px-[calc(50%-22rem)] pb-6"
      >
        {items.map((item, index) => (
          <div
            key={index}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            className={cn(
              "snap-center shrink-0 w-[20rem] sm:w-[30rem] lg:w-[44rem] transition-all duration-500",
              active === index ? "scale-100 opacity-100" : "scale-[0.92] opacity-55",
              itemClassName,
            )}
          >
            {item}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollToIndex(active - 1)}
            className="hidden sm:grid absolute left-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-(--gold)/35 bg-(--emerald-deep)/80 text-(--gold-soft) place-items-center hover:bg-(--gold) hover:text-(--primary-foreground) transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(active + 1)}
            className="hidden sm:grid absolute right-2 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-(--gold)/35 bg-(--emerald-deep)/80 text-(--gold-soft) place-items-center hover:bg-(--gold) hover:text-(--primary-foreground) transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="mt-1 flex justify-center gap-2">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  active === index ? "w-8 bg-(--gold)" : "w-2 bg-(--gold-soft)/35 hover:bg-(--gold-soft)/70",
                )}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
