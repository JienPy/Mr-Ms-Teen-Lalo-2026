import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-display text-gold-gradient">404</h1>
        <h2 className="mt-4 text-xl font-display text-(--ivory)">Page not found</h2>
        <p className="mt-2 text-sm text-(--ivory)/60">This page doesn't exist or has been moved.</p>
        <a href="/" className="mt-6 inline-block px-6 py-2 rounded-full bg-gold-gradient text-(--primary-foreground) text-sm uppercase tracking-[0.2em]">
          Go home
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-display text-gold-gradient">Something went wrong</h1>
        <p className="mt-2 text-sm text-(--ivory)/60">Please try again or head home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="px-5 py-2 rounded-full bg-gold-gradient text-(--primary-foreground) text-sm uppercase tracking-[0.2em]">
            Try again
          </button>
          <a href="/" className="px-5 py-2 rounded-full border border-(--gold)/60 text-(--gold-soft) text-sm uppercase tracking-[0.2em]">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mr. & Ms. Teen Lalo 2026 — SK Barangay Lalo" },
      { name: "description", content: "Beyond Beauty and Confidence: Empowering the Youth of Barangay Lalo. The official pageant of the Sangguniang Kabataan, Barangay Lalo, City of Tayabas. August 30, 2026 at Silungang Bayan." },
      { name: "author", content: "Sangguniang Kabataan – Barangay Lalo" },
      { property: "og:title", content: "Mr. & Ms. Teen Lalo 2026" },
      { property: "og:description", content: "Beyond Beauty and Confidence: Empowering the Youth of Barangay Lalo. August 30, 2026 · Silungang Bayan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://yswxzqnmzqxegohaaptq.supabase.co" },
      { rel: "dns-prefetch", href: "https://yswxzqnmzqxegohaaptq.supabase.co" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
