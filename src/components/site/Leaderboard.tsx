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
    return <img src={image} alt={candidate.name} className="h-16 w-16 rounded-full object-cover ring-1 ring-(--gold)/40" />;
  }

  return (
    <div className="h-16 w-16 rounded-full bg-(--secondary) grid place-items-center text-(--gold) font-display text-2xl">
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
    <Reveal>
      <div className="glass-emerald rounded-2xl p-5 lg:p-6 h-full">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h3 className="font-display text-2xl text-gold-gradient">{title}</h3>
          <span className="text-[10px] uppercase tracking-[0.25em] text-(--gold-soft)/65">
            {candidates.length} qualified
          </span>
        </div>

        {candidates.length > 0 ? (
          <div className="grid gap-3">
            {candidates.map((candidate: any, index: number) => (
              <Reveal key={candidate.candidate_id} delay={index * 0.04}>
                <article className="rounded-xl border border-(--gold)/20 bg-(--emerald-deep)/45 p-4 flex items-center gap-4 hover:border-(--gold)/45 transition-colors">
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
