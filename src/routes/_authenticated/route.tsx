import { useEffect } from "react";
import { createFileRoute, Outlet, redirect, useNavigate, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

async function verifyAdminSession() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return false;

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  return !!roles;
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth", replace: true });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function recheckSession() {
      const isAdmin = await verifyAdminSession();
      if (cancelled || isAdmin) return;
      await supabase.auth.signOut();
      navigate({ to: "/auth", replace: true });
    }

    const onPageShow = () => {
      router.invalidate();
      recheckSession();
    };
    const onFocus = () => recheckSession();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") recheckSession();
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    recheckSession();

    return () => {
      cancelled = true;
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [navigate, router]);

  return <Outlet />;
}
