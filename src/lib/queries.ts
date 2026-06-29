import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const candidatesQuery = queryOptions({
  queryKey: ["candidates"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("is_active", true)
      .order("division", { ascending: true })
      .order("card_order", { ascending: true, nullsFirst: false })
      .order("candidate_number", { ascending: true, nullsFirst: false })
      .order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export const candidatePhotosQuery = queryOptions({
  queryKey: ["candidate-photos"],
  queryFn: async () => {
    const { data, error } = await (supabase.from("candidate_photos") as any)
      .select("*")
      .order("candidate_id", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("candidate_photos")) return [];
      throw error;
    }
    return data ?? [];
  },
});

export const leaderboardQuery = queryOptions({
  queryKey: ["leaderboard"],
  queryFn: async () => {
    const { data, error } = await (supabase as any).rpc("get_public_standings");
    if (error) throw error;
    return data ?? [];
  },
  refetchInterval: 60_000,
});

export const announcementsQuery = queryOptions({
  queryKey: ["announcements"],
  queryFn: async () => {
    const now = new Date();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_hidden", false)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).filter((a: any) => {
      const fromOk = !a.show_from || new Date(a.show_from) <= now;
      const untilOk = !a.show_until || new Date(a.show_until) >= now;
      return fromOk && untilOk;
    });
  },
});

export const albumsQuery = queryOptions({
  queryKey: ["albums"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("albums")
      .select("*, photos(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const videosQuery = queryOptions({
  queryKey: ["videos"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const sponsorsQuery = queryOptions({
  queryKey: ["sponsors"],
  queryFn: async () => {
    const { data, error } = await (supabase.from("sponsors") as any)
      .select("*")
      .eq("is_visible", true)
      .order("tier", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    const map: Record<string, any> = {};
    (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
    return map;
  },
});
