import {
  createFileRoute,
  useNavigate,
  Link,
  redirect,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GoldButton } from "@/components/luxury/GoldButton";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import coupleEmblem from "@/assets/couple-emblem.png";
import { toast } from "sonner";
import { verifyAuthorizedSession } from "@/lib/adminSession";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    const isAuthorized = await verifyAuthorizedSession();
    if (isAuthorized) throw redirect({ to: "/admin", replace: true });
    await supabase.auth.signOut();
  },
  head: () => ({
    meta: [{ title: "Admin Login — Mister & Miss Teen Lalo 2026" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    verifyAuthorizedSession().then((isAuthorized) => {
      if (isAuthorized) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return toast.error("Invalid admin credentials.");
    const isAuthorized = await verifyAuthorizedSession();
    if (!isAuthorized) {
      await supabase.auth.signOut();
      return toast.error(
        "This account is not authorized for the admin dashboard.",
      );
    }
    toast.success("Welcome back.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 py-10 damask-overlay">
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.3em] text-(--gold-soft)/70 hover:text-(--gold)"
        >
          ← Back to site
        </Link>
      </div>
      <div className="w-full max-w-md glass-emerald rounded-3xl p-10 relative">
        <img
          src={coupleEmblem}
          alt=""
          aria-hidden
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-28 opacity-90 animate-glow-pulse"
        />
        <div className="text-center pt-12">
          <div className="text-[10px] uppercase tracking-[0.4em] text-(--gold-soft)/70">
            SK Barangay Lalo
          </div>
          <h1 className="font-display text-3xl text-gold-gradient mt-2">
            Admin Login
          </h1>
          <GoldDivider />
        </div>
        <form onSubmit={submit} className="space-y-4 mt-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/80 block mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-(--emerald-deep)/80 border border-(--gold)/30 px-4 py-3 text-(--ivory) focus:outline-none focus:border-(--gold)"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/80 block mb-2">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-(--emerald-deep)/80 border border-(--gold)/30 px-4 py-3 text-(--ivory) focus:outline-none focus:border-(--gold)"
            />
          </div>
          <GoldButton type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Please wait..." : "Sign In"}
          </GoldButton>
          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-(--ivory)/40 mt-4">
            Authorized administrator access only.
          </p>
        </form>
      </div>
    </div>
  );
}
