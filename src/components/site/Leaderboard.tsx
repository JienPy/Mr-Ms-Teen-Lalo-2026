import { useSuspenseQuery } from "@tanstack/react-query";
import { candidatePhotosQuery, leaderboardQuery } from "@/lib/queries";
import { top7ImageFor } from "@/lib/candidatePhotos";
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

function Avatar({ candidate, image }: { candidate: any; image?: string | null }) {
  if (image) {
    return <img src={image} alt={candidate.name} className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-(--gold)/40 sm:h-16 sm:w-16" />;
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
        <div className="mb-5 flex min-w-0 flex-col gap-2 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-4">
          <h3 className="font-display text-2xl text-gold-gradient">{title}</h3>
          <span className="text-[10px] uppercase tracking-[0.18em] text-(--gold-soft)/65 sm:tracking-[0.25em]">
            {candidates.length} qualified
          </span>
        </div>

        {candidates.length > 0 ? (
          <div className="grid min-w-0 gap-3">
            {candidates.map((candidate: any, index: number) => (
              <Reveal key={candidate.candidate_id} delay={index * 0.04} className="min-w-0">
                <article className="flex min-w-0 items-center gap-3 rounded-xl border border-(--gold)/20 bg-(--emerald-deep)/45 p-3 transition-colors hover:border-(--gold)/45 sm:gap-4 sm:p-4">
                  <Avatar candidate={candidate} image={top7ImageFor(candidate, photos)} />
                  <div className="min-w-0">
                    <div className="font-display text-xl text-(--ivory) truncate">{candidate.name}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-(--ivory)/50 truncate">
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

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        <TopSevenColumn title="Mr. Teen" candidates={mrTop} photos={candidatePhotos} />
        <TopSevenColumn title="Ms. Teen" candidates={msTop} photos={candidatePhotos} />
      </div>

      <p className="text-center mt-10 text-xs text-(--ivory)/50 font-serif italic">
        Weekly qualifiers are displayed in randomized order to keep exact standings private.
      </p>
    </div>
  );
}
