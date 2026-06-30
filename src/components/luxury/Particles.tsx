import { useEffect, useMemo, useState } from "react";

function seeded(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

export function GoldParticles({ count = 36 }: { count?: number }) {
  const [mounted, setMounted] = useState(false);
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: seeded(i + 1) * 100,
        top: seeded(i + 101) * 100,
        size: 2 + seeded(i + 201) * 4,
        delay: seeded(i + 301) * 6,
        duration: 6 + seeded(i + 401) * 8,
        opacity: 0.3 + seeded(i + 501) * 0.6,
      })),
    [count],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: "radial-gradient(circle, #E6C878 0%, rgba(230,200,120,0) 70%)",
            filter: "blur(0.5px)",
            opacity: d.opacity,
            animation: `float-particle ${d.duration}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
