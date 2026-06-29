export function GoldDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-4 my-10" aria-hidden={!label}>
      <span className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-transparent via-(--gold)/60 to-(--gold)" />
      <span className="text-(--gold) text-lg" style={{ fontFamily: "var(--font-display)" }}>
        {label ?? "✦"}
      </span>
      <span className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-transparent via-(--gold)/60 to-(--gold)" />
    </div>
  );
}
