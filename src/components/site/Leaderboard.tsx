import { useSuspenseQuery } from "@tanstack/react-query";
import { candidatePhotosQuery, leaderboardQuery } from "@/lib/queries";
import { top7PhotoFor } from "@/lib/candidatePhotos";
import { Reveal } from "@/components/luxury/Reveal";

function hiddenSortValue(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function displayTopSeven(data: any[], division: "mr" | "ms") {
  const qualified = data
    .filter((candidate) => candidate.division === division && Number(candidate.percentage) > 0)
    .slice(0, 7);

  return [...qualified].sort((a, b) => {
    const seedA = hiddenSortValue(`${a.week_start}-${division}-${a.candidate_id}`);
    const seedB = hiddenSortValue(`${b.week_start}-${division}-${b.candidate_id}`);
    return seedA - seedB;
  });
}

function top7Transform(photo?: any) {
  const zoom = Number(photo?.top7_zoom) || 1.8;
  const offsetX = Number(photo?.top7_offset_x) || 0;
  const offsetY = Number(photo?.top7_offset_y) || 14;
  return {
    transform: `translate(${offsetX}%, ${offsetY}%) scale(${zoom})`,
    transformOrigin: "center",
  };
}

function Avatar({ candidate, photo }: { candidate: any; photo?: any | null }) {
  const image = photo?.image_url ?? candidate.photo_url;

  if (image) {
    return (
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-(--gold)/40 sm:h-16 sm:w-16">
        <img
          src={image}
          alt={candidate.name}
          className="h-full w-full object-cover"
          style={top7Transform(photo)}
        />
      </div>
    );
  }

  return (
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-(--secondary) font-display text-xl text-(--gold) sm:h-16 sm:w-16 sm:text-2xl">
      {candidate.name.charAt(0)}
    </div>
  );
}

function TopSevenColumn({
  title,
  candidates,
  photos,
}: {
  title: string;
  candidates: any[];
  photos: any[];
}) {
  return (
    <Reveal className="min-w-0">
      <div className="glass-emerald min-w-0 rounded-2xl p-4 h-full sm:p-5 lg:p-6">
        <div className="mb-5 flex min-w-0 flex-wrap items-center justify-between gap-2 sm:gap-4">
          <h3 className="font-display text-xl text-gold-gradient sm:text-2xl">{title}</h3>
          <span className="rounded-full border border-(--gold)/20 bg-(--emerald-deep)/35 px-3 py-1 text-[9px] uppercase tracking-[0.16em] text-(--gold-soft)/70 sm:text-[10px] sm:tracking-[0.25em]">
            {candidates.length} qualified
          </span>
        </div>

        {candidates.length > 0 ? (
          <div className="grid min-w-0 gap-3 min-[520px]:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
            {candidates.map((candidate: any, index: number) => (
              <Reveal key={candidate.candidate_id} delay={index * 0.04} className="min-w-0">
                <article className="flex min-w-0 items-center gap-3 rounded-xl border border-(--gold)/20 bg-(--emerald-deep)/45 p-3 transition-colors hover:border-(--gold)/45 sm:gap-4 sm:p-4 md:gap-3 xl:gap-4">
                  <Avatar candidate={candidate} photo={top7PhotoFor(candidate, photos)} />
                  <div className="min-w-0">
                    <div className="break-words font-display text-base leading-snug text-(--ivory) sm:text-lg xl:text-xl">{candidate.name}</div>
                    <div className="mt-1 break-words text-[9px] uppercase tracking-[0.18em] text-(--ivory)/50 sm:text-[10px] sm:tracking-[0.25em]">
                      {candidate.sitio || "Barangay Lalo"}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-(--gold)/20 p-8 text-center text-(--ivory)/55 font-serif italic">
            No qualified candidates yet.
          </div>
        )}
      </div>
    </Reveal>
  );
}

export function Leaderboard() {
  const { data = [] } = useSuspenseQuery(leaderboardQuery);
  const { data: candidatePhotos = [] } = useSuspenseQuery(candidatePhotosQuery);

  const mrTop = displayTopSeven(data, "mr");
  const msTop = displayTopSeven(data, "ms");
  const week = data.find((candidate: any) => candidate.week_start && candidate.week_end);

  if (data.length === 0 || (mrTop.length === 0 && msTop.length === 0)) {
    return (
      <div className="text-center text-(--ivory)/60 font-serif italic">
        Weekly Top 7 will appear once published ticket entries are available.
      </div>
    );
  }

  return (
    <div>
      {week && (
        <div className="text-center mb-8 text-[11px] uppercase tracking-[0.35em] text-(--gold-soft)/80">
          Week of {week.week_start} - {week.week_end}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-8 items-start">
        <TopSevenColumn title="Mr. Teen" candidates={mrTop} photos={candidatePhotos} />
        <TopSevenColumn title="Ms. Teen" candidates={msTop} photos={candidatePhotos} />
      </div>

      <p className="text-center mt-10 text-xs text-(--ivory)/50 font-serif italic">
        Weekly qualifiers are displayed in randomized order to keep exact standings private.
      </p>
    </div>
  );
}
