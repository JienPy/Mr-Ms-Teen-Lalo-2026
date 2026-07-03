import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_PAGEANT_PEOPLE = [
  { id: "sk-chairman", group_type: "sk", name: "Aldwin C. Castro", role: "SK Chairman", photo_url: null, facebook_url: null, contact_number: null, sort_order: 1, is_visible: true },
  { id: "sk-kim-durante", group_type: "sk", name: "Kim Durante", role: "SK Kagawad", photo_url: null, facebook_url: null, contact_number: null, sort_order: 2, is_visible: true },
  { id: "sk-girlie-javin", group_type: "sk", name: "Girlie Javin", role: "SK Kagawad", photo_url: null, facebook_url: null, contact_number: null, sort_order: 3, is_visible: true },
  { id: "sk-reymart-javin", group_type: "sk", name: "Reymart Javin", role: "SK Kagawad", photo_url: null, facebook_url: null, contact_number: null, sort_order: 4, is_visible: true },
  { id: "sk-harvey-clado", group_type: "sk", name: "Harvey Clado", role: "SK Kagawad", photo_url: null, facebook_url: null, contact_number: null, sort_order: 5, is_visible: true },
  { id: "sk-kenneth-leo-zafranco", group_type: "sk", name: "Kenneth Leo Zafranco", role: "SK Kagawad", photo_url: null, facebook_url: null, contact_number: null, sort_order: 6, is_visible: true },
  { id: "sk-darrian-edrad", group_type: "sk", name: "Darrian Edrad", role: "SK Kagawad", photo_url: null, facebook_url: null, contact_number: null, sort_order: 7, is_visible: true },
  { id: "sk-secretary", group_type: "sk", name: "Monica Palma", role: "SK Secretary", photo_url: null, facebook_url: null, contact_number: null, sort_order: 8, is_visible: true },
  { id: "sk-treasurer", group_type: "sk", name: "Jien Claude Valancio", role: "SK Treasurer", photo_url: null, facebook_url: null, contact_number: null, sort_order: 9, is_visible: true },
  { id: "organizer-keissy-palma-rayel", group_type: "organizer", name: "Keissy Palma Rayel", role: "Organizer", photo_url: null, facebook_url: "https://www.facebook.com/keissyofficial", contact_number: null, sort_order: 1, is_visible: true },
  { id: "organizer-vercie-edrad", group_type: "organizer", name: "Vercie Edrad", role: "Organizer", photo_url: null, facebook_url: "https://www.facebook.com/vercie.baer", contact_number: null, sort_order: 2, is_visible: true },
  { id: "organizer-mystica-labner", group_type: "organizer", name: "Mystica Labner", role: "Organizer", photo_url: null, facebook_url: "https://www.facebook.com/ian.ansay.1", contact_number: null, sort_order: 3, is_visible: true },
  { id: "organizer-angel-del-mundo", group_type: "organizer", name: "Angel Del Mundo", role: "Organizer", photo_url: null, facebook_url: "https://www.facebook.com/angel.delmundo.56", contact_number: null, sort_order: 4, is_visible: true },
  { id: "organizer-cedrick-abuel", group_type: "organizer", name: "Cedrick Abuel", role: "Organizer", photo_url: null, facebook_url: "https://www.facebook.com/ced.abuel94", contact_number: null, sort_order: 5, is_visible: true },
];

export const DEFAULT_SPONSORS = [
  { id: "sponsor-banahaw-glass-villa", name: "Banahaw Glass Villa", tier: "community", logo_url: null, description: null, link_url: null, sort_order: 4, is_visible: true },
];

const REMOVED_SEEDED_SPONSORS = new Set([
  "jun baretto tabi",
  "doris obciana maeda",
  "la imperial",
]);

function personKey(person: any) {
  return `${person.group_type ?? ""}:${String(person.name ?? "").toLowerCase()}`;
}

function sponsorKey(sponsor: any) {
  return String(sponsor.name ?? "").toLowerCase();
}

export function withDefaultPageantPeople(data: any[] | null | undefined) {
  const rows = data ?? [];
  const keys = new Set(rows.map(personKey));
  return [...rows, ...DEFAULT_PAGEANT_PEOPLE.filter((person) => !keys.has(personKey(person)))];
}

export function withDefaultSponsors(data: any[] | null | undefined) {
  const rows = (data ?? []).filter((sponsor) => !REMOVED_SEEDED_SPONSORS.has(sponsorKey(sponsor)));
  const keys = new Set(rows.map(sponsorKey));
  return [...rows, ...DEFAULT_SPONSORS.filter((sponsor) => !keys.has(sponsorKey(sponsor)))];
}

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
  staleTime: 60_000,
  refetchInterval: 60_000,
  refetchOnWindowFocus: true,
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
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("sponsors")) {
        return DEFAULT_SPONSORS;
      }
      throw error;
    }
    return withDefaultSponsors(data);
  },
});

export const pageantPeopleQuery = queryOptions({
  queryKey: ["pageant-people"],
  queryFn: async () => {
    const { data, error } = await (supabase.from("pageant_people") as any)
      .select("*")
      .eq("is_visible", true)
      .order("group_type", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("name");
    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("pageant_people")) {
        return DEFAULT_PAGEANT_PEOPLE;
      }
      throw error;
    }
    return withDefaultPageantPeople(data);
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
