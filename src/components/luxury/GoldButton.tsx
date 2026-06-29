import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const GoldButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "solid", className, children, ...rest }, ref) => {
    const base =
      "relative inline-flex items-center justify-center gap-2 font-display uppercase tracking-[0.18em] text-sm px-7 py-3 rounded-full transition-all duration-300 shine-on-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-(--gold) disabled:opacity-50";
    const styles: Record<Variant, string> = {
      solid:
        "bg-gold-gradient text-(--primary-foreground) shadow-[0_10px_30px_-10px_rgba(201,162,75,0.7)] hover:shadow-[0_14px_44px_-12px_rgba(230,200,120,0.85)] hover:-translate-y-0.5",
      outline:
        "border border-(--gold)/70 text-(--gold-soft) hover:bg-(--gold)/10 hover:border-(--gold)",
      ghost: "text-(--gold-soft) hover:text-(--ivory)",
    };
    return (
      <button ref={ref} className={cn(base, styles[variant], className)} {...rest}>
        {children}
      </button>
    );
  },
);
GoldButton.displayName = "GoldButton";
