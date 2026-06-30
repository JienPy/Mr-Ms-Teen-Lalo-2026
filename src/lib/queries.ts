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

export const DEFAULT_CANDIDATE_CONTACTS: Record<string, { facebook_url?: string; contact_number?: string | null }> = {
  "adrian n. sta. ana": { facebook_url: "https://www.facebook.com/adrian.sta.ana.460022", contact_number: "09386724590" },
  "britney armocilla": { facebook_url: "https://www.facebook.com/BritneyArmocilla", contact_number: "09663771668" },
  "carlos jose z. labaquis": { facebook_url: "https://www.facebook.com/carlosjose.labaguis.3", contact_number: "09106384061" },
  "criza jen c. capistrano": { facebook_url: "https://www.facebook.com/crishyy12", contact_number: "09706611140" },
  "joyce anne rose b. cena": { facebook_url: "https://www.facebook.com/joyceannerose.cena.1", contact_number: "09483896610" },
  "kave izzy d. oates": { facebook_url: "https://www.facebook.com/kaveizzy.oates", contact_number: "09481869497" },
  "ken brian p. edrad": { facebook_url: "https://www.facebook.com/bryan.edrad.2024", contact_number: "09939928649" },
  "chris daniel l. dadis": { facebook_url: "https://www.facebook.com/daniel.dadis.2025", contact_number: "09512357325" },
  "rieven v. villa": { facebook_url: "https://www.facebook.com/profile.php?id=100084121066177", contact_number: "09386442223" },
  "emerald a. delgado": { facebook_url: "https://www.facebook.com/emerald.delgado.509", contact_number: "09423381995" },
  "kian ezekiel v. edrad": { facebook_url: "https://www.facebook.com/ezekiel.edrad", contact_number: "09703388110" },
  "hannah grace d. lesma": { facebook_url: "https://www.facebook.com/hannah.grace.durante.lesma", contact_number: "09945821769" },
  "janine crisibelle s. lopez": { facebook_url: "https://www.facebook.com/ichaaqx", contact_number: "09853155822" },
  "jonas r. javin": { facebook_url: "https://www.facebook.com/jonas.javin", contact_number: null },
  "kurt rafanan": { facebook_url: "https://www.facebook.com/txrkzzzzz", contact_number: "09483532352" },
  "kyla mae ecal": { facebook_url: "https://www.facebook.com/kyla.mae.ecal.2025", contact_number: "09817340863" },
  "princess loren l. ricamata": { facebook_url: "https://www.facebook.com/princesslorenricamata4", contact_number: "09855500466" },
  "cielo mae s. caagbay": { facebook_url: "https://www.facebook.com/caagbaycielo", contact_number: "09564975048" },
  "mirence felicity e. javin": { facebook_url: "https://www.facebook.com/mirencefelicity.javin", contact_number: "09308275923" },
  "precious nicole guevarra": { facebook_url: "https://www.facebook.com/preciousnicole.guevarra.5", contact_number: "09854400950" },
  "raven zian t. leones": { facebook_url: "https://www.facebook.com/raven.zian.leones", contact_number: "09183206200" },
  "reese denielle nuqui": { facebook_url: "https://www.facebook.com/reese.nuqui.58", contact_number: "09637873136" },
  "symon d. pabularcon": { facebook_url: "https://www.facebook.com/symon.pabularcon.71", contact_number: "09187728994" },
  "tyron p. veloso": { facebook_url: "https://www.facebook.com/tyron.veloso.73", contact_number: "09469590669" },
};

function withDefaultCandidateContacts(candidate: any) {
  const defaults = DEFAULT_CANDIDATE_CONTACTS[String(candidate.name ?? "").toLowerCase()] ?? {};
  return {
    ...candidate,
    facebook_url: candidate.facebook_url ?? defaults.facebook_url ?? null,
    contact_number: candidate.contact_number ?? defaults.contact_number ?? null,
  };
}

export const DEFAULT_SPONSORS = [
  { id: "sponsor-jun-baretto-tabi", name: "Jun Baretto Tabi", tier: "community", logo_url: null, description: null, link_url: null, sort_order: 1, is_visible: true },
  { id: "sponsor-doris-obciana-maeda", name: "Doris Obciana Maeda", tier: "community", logo_url: null, description: null, link_url: null, sort_order: 2, is_visible: true },
  { id: "sponsor-la-imperial", name: "LA Imperial", tier: "community", logo_url: null, description: null, link_url: null, sort_order: 3, is_visible: true },
  { id: "sponsor-banahaw-glass-villa", name: "Banahaw Glass Villa", tier: "community", logo_url: null, description: null, link_url: null, sort_order: 4, is_visible: true },
];

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
  const rows = data ?? [];
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
    return (data ?? []).map(withDefaultCandidateContacts);
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
