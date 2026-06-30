import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GoldButton } from "@/components/luxury/GoldButton";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { toast } from "sonner";
import {
  candidatesQuery, announcementsQuery, albumsQuery, videosQuery, sponsorsQuery, settingsQuery, pageantPeopleQuery, DEFAULT_PAGEANT_PEOPLE, DEFAULT_SPONSORS, withDefaultPageantPeople, withDefaultSponsors,
} from "@/lib/queries";
import { LogOut, Plus, Trash2, Edit3, Image as ImageIcon, X, Pin, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Mr. & Ms. Teen Lalo 2026" }] }),
  component: AdminDashboard,
});

const TABS = ["Overview", "Candidates", "Tickets", "Announcements", "Gallery", "Videos", "Sponsors", "Officials", "Settings"] as const;
type Tab = typeof TABS[number];
type DashboardRole = "admin" | "chairman";

function localDateInputValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function isSupabaseId(id?: string | null) {
  return !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function localDateTimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function dateTimeInputToIso(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function weekRangeForDate(dateValue = localDateInputValue()) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const isoDay = date.getDay() === 0 ? 7 : date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - isoDay + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: localDateInputValue(start),
    end: localDateInputValue(end),
  };
}

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("Overview");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: dashboardRole = "chairman" } = useQuery({
    queryKey: ["dashboard-role"],
    queryFn: async (): Promise<DashboardRole> => {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return "chairman";
      const { data } = await (supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .in("role", ["admin", "chairman"]) as any);
      return data?.some((row: any) => row.role === "admin") ? "admin" : "chairman";
    },
  });
  const availableTabs = TABS.filter((t) => dashboardRole === "admin" || t !== "Tickets");

  useEffect(() => {
    if (dashboardRole !== "admin" && tab === "Tickets") setTab("Overview");
  }, [dashboardRole, tab]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen text-(--ivory)">
      <header className="border-b border-(--gold)/20 bg-(--emerald-deep)/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/70">Admin Dashboard</div>
            <div className="font-display text-lg text-gold-gradient">Mr. & Ms. Teen Lalo 2026</div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs uppercase tracking-[0.25em] text-(--ivory)/70 hover:text-(--gold-soft)">View Site</Link>
            <button onClick={signOut} className="text-xs uppercase tracking-[0.25em] text-(--gold-soft) flex items-center gap-2 hover:text-(--gold)">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-5 flex gap-2 overflow-x-auto pb-2 scrollbar-gold">
          {availableTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.25em] whitespace-nowrap transition-all ${
                tab === t ? "bg-gold-gradient text-(--primary-foreground)" : "text-(--ivory)/70 hover:text-(--gold-soft) border border-(--gold)/20"
              }`}
            >{t}</button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-10">
        {tab === "Overview" && <Overview role={dashboardRole} />}
        {tab === "Candidates" && <CandidatesAdmin />}
        {dashboardRole === "admin" && tab === "Tickets" && <TicketsAdmin />}
        {tab === "Announcements" && <AnnouncementsAdmin />}
        {tab === "Gallery" && <GalleryAdmin />}
        {tab === "Videos" && <VideosAdmin />}
        {tab === "Sponsors" && <SponsorsAdmin />}
        {tab === "Officials" && <OfficialsAdmin />}
        {tab === "Settings" && <SettingsAdmin />}
      </main>
    </div>
  );
}

/* ============== shared helpers ============== */

async function uploadToStorage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("pageant").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("pageant").getPublicUrl(path);
  return data.publicUrl;
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="glass-emerald rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl text-gold-gradient">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function TextField({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/80">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full rounded-lg bg-(--emerald-deep)/80 border border-(--gold)/30 px-3 py-2 text-(--ivory) focus:outline-none focus:border-(--gold)"
      />
    </label>
  );
}

function TextArea({ label, ...rest }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/80">{label}</span>
      <textarea
        {...rest}
        className="mt-1 w-full rounded-lg bg-(--emerald-deep)/80 border border-(--gold)/30 px-3 py-2 text-(--ivory) min-h-[100px] focus:outline-none focus:border-(--gold)"
      />
    </label>
  );
}

function Select({ label, children, ...rest }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/80">{label}</span>
      <select {...rest} className="mt-1 w-full rounded-lg bg-(--emerald-deep)/80 border border-(--gold)/30 px-3 py-2 text-(--ivory) focus:outline-none focus:border-(--gold)">
        {children}
      </select>
    </label>
  );
}

function ImageUpload({ value, onChange, folder, label = "Image" }: { value?: string | null; onChange: (url: string | null) => void; folder: string; label?: string }) {
  const [uploading, setUploading] = useState(false);
  async function onFile(f: File) {
    setUploading(true);
    try {
      const url = await uploadToStorage(f, folder);
      onChange(url);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/80 mb-2">{label}</div>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="w-20 h-20 object-cover rounded-lg ring-1 ring-(--gold)/40" />
            <button onClick={() => onChange(null)} className="absolute -top-2 -right-2 bg-(--destructive) rounded-full p-1">
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border border-dashed border-(--gold)/40 grid place-items-center text-(--gold-soft)/50">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
        <label className="cursor-pointer text-xs uppercase tracking-[0.2em] text-(--gold-soft) hover:text-(--gold) flex items-center gap-2">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading…" : "Choose file"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}

/* ============== OVERVIEW ============== */

function Overview({ role }: { role: DashboardRole }) {
  const candidates = useQuery(candidatesQuery);
  const announcements = useQuery(announcementsQuery);
  const albums = useQuery(albumsQuery);
  const videos = useQuery(videosQuery);
  const sponsors = useQuery(sponsorsQuery);
  const people = useQuery(pageantPeopleQuery);
  const stats = [
    { label: "Candidates", value: candidates.data?.length ?? 0 },
    { label: "Announcements", value: announcements.data?.length ?? 0 },
    { label: "Albums", value: albums.data?.length ?? 0 },
    { label: "Videos", value: videos.data?.length ?? 0 },
    { label: "Sponsors", value: sponsors.data?.length ?? 0 },
    { label: "Officials", value: people.data?.length ?? 0 },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-emerald rounded-2xl p-6 text-center">
            <div className="font-display text-4xl text-gold-gradient">{s.value}</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/70 mt-2">{s.label}</div>
          </div>
        ))}
      </div>
      <Panel title="Welcome">
        <p className="text-(--ivory)/80 font-serif text-lg">
          {role === "admin"
            ? "Manage the entire site from here. Add candidates, encode ticket pickups, post announcements, upload photos & videos, and edit the public copy from Settings."
            : "Manage public site content from here. Add candidates, post announcements, upload photos & videos, update sponsors and officials, and edit the public copy from Settings."}
        </p>
        {role === "admin" && (
          <p className="mt-3 text-(--ivory)/60 text-sm">
            Public visitors only see the weekly Top 7 names. Raw ticket counts stay confidential to you.
          </p>
        )}
      </Panel>
    </div>
  );
}

/* ============== CANDIDATES ============== */

function CandidatesAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("candidates").select("*").order("division").order("card_order", { nullsFirst: false }).order("candidate_number", { nullsFirst: false }).order("name");
      if (error) throw error; return data ?? [];
    },
  });
  const candidatePhotos = useQuery({
    queryKey: ["admin-candidate-photos"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("candidate_photos") as any)
        .select("*")
        .order("candidate_id")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) {
        if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("candidate_photos")) return [];
        throw error;
      }
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);

  const save = useMutation({
    mutationFn: async (c: any) => {
      const payload = {
        name: c.name, division: c.division, sitio: c.sitio,
        card_order: c.card_order ? Number(c.card_order) : null,
        candidate_number: c.candidate_number ? Number(c.candidate_number) : null,
        facebook_url: c.facebook_url || null,
        contact_number: c.contact_number || null,
        belief: c.belief, motto: c.motto || c.belief, photo_url: c.photo_url, is_active: c.is_active ?? true,
      };
      if (c.id) {
        const { error } = await (supabase.from("candidates") as any).update(payload).eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("candidates") as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved.");
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["candidates"] });
      qc.invalidateQueries({ queryKey: ["candidate-photos"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
      setEditing(null); setIsNew(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("candidates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted.");
      qc.invalidateQueries({ queryKey: ["admin-candidates"] });
      qc.invalidateQueries({ queryKey: ["admin-candidate-photos"] });
      qc.invalidateQueries({ queryKey: ["candidate-photos"] });
      qc.invalidateQueries({ queryKey: ["candidates"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Panel title="Candidates" action={
      <GoldButton onClick={() => { setEditing({ division: "ms", is_active: true }); setIsNew(true); }}>
        <Plus className="w-4 h-4" /> Add
      </GoldButton>
    }>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.25em] text-(--gold-soft)/70 text-left">
            <tr><th className="p-2">#</th><th className="p-2">Name</th><th className="p-2">Division</th><th className="p-2">Sitio</th><th className="p-2">Active</th><th className="p-2"></th></tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-t border-(--gold)/10">
                <td className="p-2">{c.candidate_number ?? "—"}</td>
                <td className="p-2 flex items-center gap-2">
                  {c.photo_url ? <img src={c.photo_url} className="w-8 h-8 rounded-full object-cover" alt="" /> : <div className="w-8 h-8 rounded-full bg-(--secondary)" />}
                  {c.name}
                </td>
                <td className="p-2">{c.division === "mr" ? "Mr." : "Ms."}</td>
                <td className="p-2">{c.sitio ?? "—"}</td>
                <td className="p-2">{c.is_active ? "✓" : "—"}</td>
                <td className="p-2 text-right">
                  <button onClick={() => { setEditing(c); setIsNew(false); }} className="text-(--gold-soft) hover:text-(--gold) p-1"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => confirm(`Delete ${c.name}?`) && del.mutate(c.id)} className="text-(--destructive) hover:text-red-300 p-1"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-(--ivory)/50 italic">No candidates yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal onClose={() => { setEditing(null); setIsNew(false); }}>
          <h3 className="font-display text-2xl text-gold-gradient mb-2">{isNew ? "New" : "Edit"} Candidate</h3>
          <GoldDivider />
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            <Select label="Division" value={editing.division ?? "ms"} onChange={(e) => setEditing({ ...editing, division: e.target.value })}>
              <option value="ms">Ms. Teen</option>
              <option value="mr">Mr. Teen</option>
            </Select>
            <TextField label="Sitio" value={editing.sitio ?? ""} onChange={(e) => setEditing({ ...editing, sitio: e.target.value })} />
            <TextField label="Display Order" type="number" value={editing.card_order ?? ""} onChange={(e) => setEditing({ ...editing, card_order: e.target.value })} />
            <TextField label="Candidate #" type="number" value={editing.candidate_number ?? ""} onChange={(e) => setEditing({ ...editing, candidate_number: e.target.value })} />
            <TextField label="Facebook URL" value={editing.facebook_url ?? ""} onChange={(e) => setEditing({ ...editing, facebook_url: e.target.value })} />
            <TextField label="Contact Number" value={editing.contact_number ?? ""} onChange={(e) => setEditing({ ...editing, contact_number: e.target.value })} />
          </div>
          <div className="mt-4"><TextArea label="Kasabihan / Paniniwala" value={editing.belief ?? editing.motto ?? ""} onChange={(e) => setEditing({ ...editing, belief: e.target.value, motto: e.target.value })} /></div>
          <div className="mt-4"><ImageUpload label="Fallback Portrait" folder="candidates" value={editing.photo_url} onChange={(url) => setEditing({ ...editing, photo_url: url })} /></div>
          {editing.id ? (
            <CandidatePhotoLibrary
              candidateId={editing.id}
              photos={(candidatePhotos.data ?? []).filter((photo: any) => photo.candidate_id === editing.id)}
            />
          ) : (
            <div className="mt-4 rounded-lg border border-(--gold)/15 bg-(--emerald-deep)/45 p-4 text-sm text-(--ivory)/60">
              Save the candidate first, then reopen it to add the photo library.
            </div>
          )}
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
            Active (show on site)
          </label>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-(--ivory)/70 text-xs uppercase tracking-[0.2em]">Cancel</button>
            <GoldButton onClick={() => save.mutate(editing)} disabled={save.isPending}>Save</GoldButton>
          </div>
        </Modal>
      )}
    </Panel>
  );
}

function CandidatePhotoLibrary({ candidateId, photos }: { candidateId: string; photos: any[] }) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-candidate-photos"] });
    qc.invalidateQueries({ queryKey: ["candidate-photos"] });
    qc.invalidateQueries({ queryKey: ["candidates"] });
    qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };

  async function addPhoto(file: File) {
    setUploading(true);
    try {
      const image_url = await uploadToStorage(file, `candidates/${candidateId}`);
      const { error } = await (supabase.from("candidate_photos") as any).insert({
        candidate_id: candidateId,
        image_url,
        show_in_profile: true,
        sort_order: photos.length + 1,
      });
      if (error) throw error;
      toast.success("Candidate photo added.");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  }

  const updatePhoto = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, any> }) => {
      if (patch.is_main_portrait) {
        const { error: clearError } = await (supabase.from("candidate_photos") as any)
          .update({ is_main_portrait: false })
          .eq("candidate_id", candidateId)
          .neq("id", id);
        if (clearError) throw clearError;
      }
      const { error } = await (supabase.from("candidate_photos") as any).update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Photo updated.");
      refresh();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePhoto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("candidate_photos") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Photo deleted.");
      refresh();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="mt-5 rounded-xl border border-(--gold)/15 bg-(--emerald-deep)/45 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/80">Candidate Photo Library</div>
          <p className="mt-1 text-xs text-(--ivory)/50">Main Portrait for cards, Profile Gallery for modal, Top 7 Showcase for standings.</p>
        </div>
        <label className="cursor-pointer rounded-lg border border-(--gold)/25 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-(--gold-soft) hover:text-(--gold)">
          {uploading ? "Uploading..." : "Add Photo"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && addPhoto(e.target.files[0])} />
        </label>
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        {photos.map((photo) => (
          <CandidatePhotoCard
            key={photo.id}
            photo={photo}
            updatePhoto={updatePhoto}
            deletePhoto={deletePhoto}
          />
        ))}
      </div>
      {photos.length === 0 && <p className="py-6 text-center text-sm text-(--ivory)/50 italic">No candidate photos yet.</p>}
    </div>
  );
}

function CandidatePhotoCard({ photo, updatePhoto, deletePhoto }: { photo: any; updatePhoto: any; deletePhoto: any }) {
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [sortOrder, setSortOrder] = useState(String(photo.sort_order ?? 0));

  useEffect(() => {
    setCaption(photo.caption ?? "");
    setSortOrder(String(photo.sort_order ?? 0));
  }, [photo.caption, photo.sort_order]);

  function saveDetails() {
    updatePhoto.mutate({
      id: photo.id,
      patch: {
        caption: caption.trim() || null,
        sort_order: Number(sortOrder) || 0,
      },
    });
  }

  return (
    <div className="rounded-lg border border-(--gold)/15 p-3">
      <div className="flex gap-3">
        <img src={photo.image_url} alt={photo.caption ?? ""} className="w-24 h-28 rounded-md object-cover border border-(--gold)/20" />
        <div className="min-w-0 flex-1 space-y-2">
          <TextField
            label="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={saveDetails}
          />
          <TextField
            label="Order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            onBlur={saveDetails}
          />
        </div>
      </div>
      <div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs">
        <label className="flex items-center gap-2 rounded-lg border border-(--gold)/15 px-2 py-2">
          <input
            type="checkbox"
            checked={!!photo.is_main_portrait}
            onChange={(e) => updatePhoto.mutate({ id: photo.id, patch: { is_main_portrait: e.target.checked } })}
          />
          Main
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-(--gold)/15 px-2 py-2">
          <input
            type="checkbox"
            checked={!!photo.show_in_profile}
            onChange={(e) => updatePhoto.mutate({ id: photo.id, patch: { show_in_profile: e.target.checked } })}
          />
          Profile
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-(--gold)/15 px-2 py-2">
          <input
            type="checkbox"
            checked={!!photo.show_in_top7}
            onChange={(e) => updatePhoto.mutate({ id: photo.id, patch: { show_in_top7: e.target.checked } })}
          />
          Top 7
        </label>
      </div>
      <div className="mt-3 flex justify-end">
        <button onClick={() => confirm("Delete this candidate photo?") && deletePhoto.mutate(photo.id)} className="text-[10px] uppercase tracking-[0.2em] text-(--destructive)">
          Delete
        </button>
      </div>
    </div>
  );
}

/* ============== TICKETS / LEADERBOARD ============== */

function TicketsAdmin() {
  const qc = useQueryClient();
  const currentWeek = weekRangeForDate();
  const emptyForm = {
    candidate_id: "",
    quantity: 50,
    entry_date: localDateInputValue(),
    serial_from: "",
    serial_to: "",
    note: "",
  };

  const candidates = useQuery({
    queryKey: ["admin-candidates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("candidates").select("id,name,division").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });
  const ticketEntries = useQuery({
    queryKey: ["ticket-entries"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("ticket_entries") as any)
        .select("*, candidates(id,name,division,sitio)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const standings = useQuery({
    queryKey: ["admin-standings"],
    queryFn: async () => {
      const [{ data: candidateRows, error: candidatesError }, { data: entries, error: entriesError }] = await Promise.all([
        supabase.from("candidates").select("id,name,division,sitio").eq("is_active", true),
        (supabase.from("ticket_entries") as any).select("candidate_id,quantity,entry_date,is_published").eq("is_published", true),
      ]);
      if (candidatesError) throw candidatesError;
      if (entriesError) throw entriesError;

      const totals = new Map<string, { total: number; week: number }>();
      for (const entry of entries ?? []) {
        const row = totals.get(entry.candidate_id) ?? { total: 0, week: 0 };
        const qty = Number(entry.quantity) || 0;
        row.total += qty;
        if (entry.entry_date >= currentWeek.start && entry.entry_date <= currentWeek.end) row.week += qty;
        totals.set(entry.candidate_id, row);
      }

      return (candidateRows ?? [])
        .map((candidate) => {
          const counts = totals.get(candidate.id) ?? { total: 0, week: 0 };
          return {
            candidate_id: candidate.id,
            name: candidate.name,
            division: candidate.division,
            sitio: candidate.sitio,
            total_tickets: counts.total,
            week_tickets: counts.week,
          };
        })
        .sort((a, b) =>
          b.week_tickets - a.week_tickets ||
          b.total_tickets - a.total_tickets ||
          a.name.localeCompare(b.name)
        );
    },
  });

  const [form, setForm] = useState<any>(emptyForm);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [entrySearch, setEntrySearch] = useState("");
  const [entryStatus, setEntryStatus] = useState<"all" | "draft" | "published">("all");
  const [entryDate, setEntryDate] = useState("");
  const [entryPage, setEntryPage] = useState(1);
  const formWeek = weekRangeForDate(form.entry_date);
  const totalWeek = (standings.data ?? []).reduce((s: number, r: any) => s + Number(r.week_tickets), 0);
  const filteredEntries = (ticketEntries.data ?? []).filter((entry: any) => {
    const candidate = entry.candidates;
    const haystack = [
      candidate?.name,
      candidate?.sitio,
      entry.serial_from,
      entry.serial_to,
      entry.note,
      entry.entry_date,
    ].filter(Boolean).join(" ").toLowerCase();
    const searchOk = !entrySearch.trim() || haystack.includes(entrySearch.trim().toLowerCase());
    const statusOk =
      entryStatus === "all" ||
      (entryStatus === "published" && entry.is_published) ||
      (entryStatus === "draft" && !entry.is_published);
    const dateOk = !entryDate || entry.entry_date === entryDate;
    return searchOk && statusOk && dateOk;
  });
  const entriesPerPage = 10;
  const entryPageCount = Math.max(1, Math.ceil(filteredEntries.length / entriesPerPage));
  const safeEntryPage = Math.min(entryPage, entryPageCount);
  const pagedEntries = filteredEntries.slice((safeEntryPage - 1) * entriesPerPage, safeEntryPage * entriesPerPage);

  const refreshTicketData = () => {
    qc.invalidateQueries({ queryKey: ["admin-standings"] });
    qc.invalidateQueries({ queryKey: ["ticket-entries"] });
    qc.invalidateQueries({ queryKey: ["leaderboard"] });
  };
  const resetForm = () => {
    setEditingEntryId(null);
    setForm(emptyForm);
  };
  const saveEntry = useMutation({
    mutationFn: async () => {
      if (!form.candidate_id) throw new Error("Pick a candidate");
      const payload = {
        candidate_id: form.candidate_id,
        quantity: Number(form.quantity),
        entry_date: form.entry_date,
        serial_from: form.serial_from || null,
        serial_to: form.serial_to || null,
        note: form.note || null,
      };
      const { error } = editingEntryId
        ? await (supabase.from("ticket_entries") as any).update(payload).eq("id", editingEntryId)
        : await (supabase.from("ticket_entries") as any).insert({ ...payload, is_published: false, published_at: null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(editingEntryId ? "Ticket entry updated." : "Ticket entry saved as draft.");
      resetForm();
      refreshTicketData();
    },
    onError: (e: any) => toast.error(e.message),
  });
  const publishEntry = useMutation({
    mutationFn: async ({ id, publish }: { id: string; publish: boolean }) => {
      const { error } = await (supabase.from("ticket_entries") as any)
        .update({ is_published: publish, published_at: publish ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.publish ? "Ticket entry published." : "Ticket entry unpublished.");
      refreshTicketData();
    },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("ticket_entries") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ticket entry deleted.");
      resetForm();
      refreshTicketData();
    },
    onError: (e: any) => toast.error(e.message),
  });
  function editEntry(entry: any) {
    setEditingEntryId(entry.id);
    setForm({
      candidate_id: entry.candidate_id,
      quantity: entry.quantity,
      entry_date: entry.entry_date,
      serial_from: entry.serial_from ?? "",
      serial_to: entry.serial_to ?? "",
      note: entry.note ?? "",
    });
  }

  return (
    <div className="space-y-6">
      <Panel title={editingEntryId ? "Edit Ticket Pickup" : "Encode Ticket Pickup"}>
        <p className="text-sm text-(--ivory)/70 mb-4">
          New pickups are saved as drafts first. Publish only after checking the candidate, quantity, date, and serial numbers.
        </p>
        <div className="mb-4 rounded-lg border border-(--gold)/15 bg-(--emerald-deep)/45 px-4 py-3 text-xs text-(--ivory)/70">
          Date Kinuha belongs to <span className="text-(--gold-soft)">Week of {formWeek.start} - {formWeek.end}</span>. Current public week is <span className="text-(--gold-soft)">{currentWeek.start} - {currentWeek.end}</span>.
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select label="Candidate" value={form.candidate_id} onChange={(e) => setForm({ ...form, candidate_id: e.target.value })}>
            <option value="">Select...</option>
            {(candidates.data ?? []).map((c: any) => (
              <option key={c.id} value={c.id}>{c.division === "mr" ? "[Mr] " : "[Ms] "}{c.name}</option>
            ))}
          </Select>
          <TextField label="Quantity" type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <TextField label="Date Kinuha" type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
          <TextField label="Serial From" value={form.serial_from} onChange={(e) => setForm({ ...form, serial_from: e.target.value })} />
          <TextField label="Serial To" value={form.serial_to} onChange={(e) => setForm({ ...form, serial_to: e.target.value })} />
          <TextField label="Note (optional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </div>
        <div className="mt-4 flex justify-end gap-3">
          {editingEntryId && <button onClick={resetForm} className="text-(--ivory)/70 text-xs uppercase tracking-[0.2em]">Cancel Edit</button>}
          <GoldButton onClick={() => saveEntry.mutate()} disabled={saveEntry.isPending}>
            <Plus className="w-4 h-4" /> {editingEntryId ? "Update Entry" : "Save Draft"}
          </GoldButton>
        </div>
      </Panel>

      <Panel title="Ticket Entries">
        <p className="text-xs text-(--ivory)/50 mb-3">Draft entries are private. Published entries count in the Top 7.</p>
        <div className="mb-4 grid md:grid-cols-[1fr_180px_180px] gap-3">
          <TextField
            label="Search"
            placeholder="Candidate, serial, note..."
            value={entrySearch}
            onChange={(e) => { setEntrySearch(e.target.value); setEntryPage(1); }}
          />
          <Select label="Status" value={entryStatus} onChange={(e) => { setEntryStatus(e.target.value as any); setEntryPage(1); }}>
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          <TextField label="Date" type="date" value={entryDate} onChange={(e) => { setEntryDate(e.target.value); setEntryPage(1); }} />
        </div>
        <div className="space-y-3">
          {pagedEntries.map((entry: any) => {
            const candidate = entry.candidates;
            const entryWeek = weekRangeForDate(entry.entry_date);
            return (
              <div key={entry.id} className="p-4 rounded-lg border border-(--gold)/15 grid lg:grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.25em]">
                    <span className={entry.is_published ? "text-(--gold)" : "text-(--ivory)/45"}>{entry.is_published ? "Published" : "Draft"}</span>
                    <span className="text-(--ivory)/35">Week {entryWeek.start} - {entryWeek.end}</span>
                  </div>
                  <div className="font-display text-lg text-(--ivory) mt-1">
                    {candidate?.division === "mr" ? "Mr. " : "Ms. "}{candidate?.name ?? "Unknown candidate"}
                  </div>
                  <div className="text-sm text-(--ivory)/65">
                    {entry.quantity} tickets · {entry.entry_date}
                    {(entry.serial_from || entry.serial_to) && <> · Serial {entry.serial_from || "?"} to {entry.serial_to || "?"}</>}
                    {entry.note && <> · {entry.note}</>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => publishEntry.mutate({ id: entry.id, publish: !entry.is_published })} className="px-3 py-2 rounded-lg border border-(--gold)/25 text-[10px] uppercase tracking-[0.2em] text-(--gold-soft)">
                    {entry.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => editEntry(entry)} className="px-3 py-2 rounded-lg border border-(--gold)/25 text-[10px] uppercase tracking-[0.2em] text-(--ivory)/75">Edit</button>
                  <button onClick={() => confirm("Delete this ticket entry?") && deleteEntry.mutate(entry.id)} className="px-3 py-2 rounded-lg border border-(--destructive)/35 text-[10px] uppercase tracking-[0.2em] text-(--destructive)">Delete</button>
                </div>
              </div>
            );
          })}
          {(ticketEntries.data ?? []).length === 0 && <p className="text-center text-(--ivory)/50 italic py-8">No ticket entries yet.</p>}
          {(ticketEntries.data ?? []).length > 0 && filteredEntries.length === 0 && <p className="text-center text-(--ivory)/50 italic py-8">No entries match the filters.</p>}
        </div>
        {filteredEntries.length > entriesPerPage && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-(--ivory)/55">
            <span>
              Showing {(safeEntryPage - 1) * entriesPerPage + 1}-{Math.min(safeEntryPage * entriesPerPage, filteredEntries.length)} of {filteredEntries.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEntryPage((page) => Math.max(1, page - 1))}
                disabled={safeEntryPage === 1}
                className="px-3 py-2 rounded-lg border border-(--gold)/20 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-(--gold-soft)">Page {safeEntryPage} of {entryPageCount}</span>
              <button
                onClick={() => setEntryPage((page) => Math.min(entryPageCount, page + 1))}
                disabled={safeEntryPage === entryPageCount}
                className="px-3 py-2 rounded-lg border border-(--gold)/20 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {(entrySearch || entryStatus !== "all" || entryDate) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => { setEntrySearch(""); setEntryStatus("all"); setEntryDate(""); setEntryPage(1); }}
              className="text-[10px] uppercase tracking-[0.2em] text-(--gold-soft)"
            >
              Clear filters
            </button>
          </div>
        )}
      </Panel>

      <Panel title="Standings (Admin Only)">
        <p className="text-xs text-(--ivory)/50 mb-3">Only published pickups are counted below and on the public Top 7.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[10px] uppercase tracking-[0.25em] text-(--gold-soft)/70 text-left">
              <tr><th className="p-2">#</th><th className="p-2">Candidate</th><th className="p-2">Div</th><th className="p-2 text-right">Week Tickets</th><th className="p-2 text-right">Total Tickets</th><th className="p-2 text-right">Public Share</th></tr>
            </thead>
            <tbody>
              {(standings.data ?? []).map((r: any, i: number) => {
                const pct = totalWeek > 0 ? (Number(r.week_tickets) / totalWeek) * 100 : 0;
                return (
                  <tr key={r.candidate_id} className="border-t border-(--gold)/10">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{r.name} {r.sitio && <span className="text-(--ivory)/50">· {r.sitio}</span>}</td>
                    <td className="p-2">{r.division === "mr" ? "Mr" : "Ms"}</td>
                    <td className="p-2 text-right tabular-nums">{r.week_tickets}</td>
                    <td className="p-2 text-right tabular-nums">{r.total_tickets}</td>
                    <td className="p-2 text-right tabular-nums text-(--gold-soft)">{pct.toFixed(2)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ============== ANNOUNCEMENTS ============== */

function AnnouncementsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("announcements") as any)
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const [editing, setEditing] = useState<any | null>(null);

  const save = useMutation({
    mutationFn: async (a: any) => {
      const payload = {
        title: a.title,
        body: a.body,
        image_url: a.image_url,
        is_pinned: !!a.is_pinned,
        is_hidden: !!a.is_hidden,
        show_from: dateTimeInputToIso(a.show_from),
        show_until: dateTimeInputToIso(a.show_until),
      };
      if (a.id) {
        const { error } = await (supabase.from("announcements") as any).update(payload).eq("id", a.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("announcements") as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Saved.");
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("announcements").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => {
      toast.success("Deleted.");
      qc.invalidateQueries({ queryKey: ["admin-announcements"] });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Panel title="Announcements" action={<GoldButton onClick={() => setEditing({ title: "", body: "", is_pinned: false, is_hidden: false })}><Plus className="w-4 h-4" /> New</GoldButton>}>
      <div className="space-y-3">
        {data.map((a: any) => (
          <div key={a.id} className="p-4 rounded-lg border border-(--gold)/15 flex justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-(--gold-soft)/70">
                {a.is_pinned && <Pin className="w-3 h-3 text-(--gold)" />}
                {a.is_hidden && <span className="text-(--ivory)/45">Hidden</span>}
                {new Date(a.published_at).toLocaleDateString()}
              </div>
              <div className="font-display text-lg text-(--ivory)">{a.title}</div>
              {(a.show_from || a.show_until) && (
                <p className="text-xs text-(--gold-soft)/70">
                  Visible: {a.show_from ? new Date(a.show_from).toLocaleString() : "now"} to {a.show_until ? new Date(a.show_until).toLocaleString() : "no end"}
                </p>
              )}
              <p className="text-sm text-(--ivory)/70 line-clamp-2">{a.body}</p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(a)} className="text-(--gold-soft) p-2"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => confirm("Delete?") && del.mutate(a.id)} className="text-(--destructive) p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-center text-(--ivory)/50 italic py-8">No announcements yet.</p>}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h3 className="font-display text-2xl text-gold-gradient mb-2">{editing.id ? "Edit" : "New"} Announcement</h3>
          <GoldDivider />
          <div className="space-y-4">
            <TextField label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <TextArea label="Body" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} />
            <ImageUpload label="Image (optional)" folder="announcements" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} />
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="Show From" type="datetime-local" value={localDateTimeInputValue(editing.show_from)} onChange={(e) => setEditing({ ...editing, show_from: e.target.value })} />
              <TextField label="Show Until" type="datetime-local" value={localDateTimeInputValue(editing.show_until)} onChange={(e) => setEditing({ ...editing, show_until: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.is_pinned} onChange={(e) => setEditing({ ...editing, is_pinned: e.target.checked })} />
              Pin to top
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.is_hidden} onChange={(e) => setEditing({ ...editing, is_hidden: e.target.checked })} />
              Hide from public site
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setEditing(null)} className="text-(--ivory)/70 text-xs uppercase tracking-[0.2em]">Cancel</button>
            <GoldButton onClick={() => save.mutate(editing)} disabled={save.isPending}>Save</GoldButton>
          </div>
        </Modal>
      )}
    </Panel>
  );
}

/* ============== GALLERY ============== */

function GalleryAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(albumsQuery);
  const [editing, setEditing] = useState<any | null>(null);

  const saveAlbum = useMutation({
    mutationFn: async (a: any) => {
      const payload = { title: a.title, type: a.type, description: a.description, cover_url: a.cover_url };
      if (a.id) { const { error } = await supabase.from("albums").update(payload).eq("id", a.id); if (error) throw error; }
      else { const { error } = await supabase.from("albums").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["albums"] }); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const delAlbum = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("albums").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Deleted."); qc.invalidateQueries({ queryKey: ["albums"] }); },
  });
  const addPhoto = useMutation({
    mutationFn: async ({ album_id, file }: { album_id: string; file: File }) => {
      const url = await uploadToStorage(file, `albums/${album_id}`);
      const { error } = await supabase.from("photos").insert({ album_id, image_url: url });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Photo added."); qc.invalidateQueries({ queryKey: ["albums"] }); },
    onError: (e: any) => toast.error(e.message),
  });
  const delPhoto = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("photos").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["albums"] }),
  });

  return (
    <Panel title="Gallery Albums" action={<GoldButton onClick={() => setEditing({ title: "", type: "past" })}><Plus className="w-4 h-4" /> New Album</GoldButton>}>
      <div className="space-y-6">
        {data.map((a: any) => (
          <div key={a.id} className="border border-(--gold)/15 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/70">{a.type}</div>
                <div className="font-display text-xl text-(--ivory)">{a.title}</div>
              </div>
              <div className="flex gap-2">
                <label className="cursor-pointer text-xs uppercase tracking-[0.2em] text-(--gold-soft) hover:text-(--gold) flex items-center gap-1">
                  <Upload className="w-4 h-4" /> Add photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && addPhoto.mutate({ album_id: a.id, file: e.target.files[0] })} />
                </label>
                <button onClick={() => setEditing(a)} className="text-(--gold-soft) p-1"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => confirm("Delete album and all its photos?") && delAlbum.mutate(a.id)} className="text-(--destructive) p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
              {(a.photos ?? []).map((p: any) => (
                <div key={p.id} className="relative group">
                  <img src={p.image_url} alt="" className="w-full aspect-square object-cover rounded-md" />
                  <button onClick={() => delPhoto.mutate(p.id)} className="absolute top-1 right-1 bg-(--destructive)/90 rounded-full p-1 opacity-0 group-hover:opacity-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-center text-(--ivory)/50 italic py-8">No albums yet.</p>}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h3 className="font-display text-2xl text-gold-gradient mb-2">{editing.id ? "Edit" : "New"} Album</h3>
          <GoldDivider />
          <div className="space-y-4">
            <TextField label="Title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Select label="Type" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="past">Past Event</option>
              <option value="upcoming">Upcoming</option>
            </Select>
            <TextArea label="Description (optional)" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <ImageUpload label="Cover Image (optional)" folder="albums" value={editing.cover_url} onChange={(url) => setEditing({ ...editing, cover_url: url })} />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setEditing(null)} className="text-(--ivory)/70 text-xs uppercase tracking-[0.2em]">Cancel</button>
            <GoldButton onClick={() => saveAlbum.mutate(editing)} disabled={saveAlbum.isPending}>Save</GoldButton>
          </div>
        </Modal>
      )}
    </Panel>
  );
}

/* ============== VIDEOS ============== */

function VideosAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(videosQuery);
  const [editing, setEditing] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: async (v: any) => {
      const payload = { title: v.title, source_type: v.source_type, url: v.url, thumbnail_url: v.thumbnail_url, tag: v.tag };
      if (v.id) { const { error } = await supabase.from("videos").update(payload).eq("id", v.id); if (error) throw error; }
      else { const { error } = await supabase.from("videos").insert(payload); if (error) throw error; }
    },
    onSuccess: () => { toast.success("Saved."); qc.invalidateQueries({ queryKey: ["videos"] }); setEditing(null); },
    onError: (e: any) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("videos").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["videos"] }),
  });

  async function uploadVideoFile(f: File) {
    setUploading(true);
    try {
      const url = await uploadToStorage(f, "videos");
      setEditing((e: any) => ({ ...(e ?? {}), source_type: "upload", url }));
      toast.success("Uploaded.");
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  return (
    <Panel title="Videos" action={<GoldButton onClick={() => setEditing({ source_type: "url", title: "", url: "" })}><Plus className="w-4 h-4" /> New</GoldButton>}>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((v: any) => (
          <div key={v.id} className="border border-(--gold)/15 rounded-xl overflow-hidden">
            <div className="aspect-video bg-(--emerald-deep) grid place-items-center text-(--gold-soft)/60">
              {v.thumbnail_url ? <img src={v.thumbnail_url} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <div className="p-3">
              <div className="font-display text-lg text-(--ivory) truncate">{v.title}</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-(--ivory)/50">{v.source_type}{v.tag ? ` · ${v.tag}` : ""}</div>
              <div className="mt-2 flex gap-2 justify-end">
                <button onClick={() => setEditing(v)} className="text-(--gold-soft) p-1"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => confirm("Delete?") && del.mutate(v.id)} className="text-(--destructive) p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-center text-(--ivory)/50 italic py-8 col-span-full">No videos yet.</p>}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h3 className="font-display text-2xl text-gold-gradient mb-2">{editing.id ? "Edit" : "New"} Video</h3>
          <GoldDivider />
          <div className="space-y-4">
            <TextField label="Title" value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <Select label="Source" value={editing.source_type} onChange={(e) => setEditing({ ...editing, source_type: e.target.value })}>
              <option value="url">External URL (YouTube / Facebook / TikTok)</option>
              <option value="upload">Uploaded file</option>
            </Select>
            {editing.source_type === "url" ? (
              <TextField label="Video URL" value={editing.url ?? ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://youtube.com/watch?v=…" />
            ) : (
              <div>
                <label className="cursor-pointer text-xs uppercase tracking-[0.2em] text-(--gold-soft) hover:text-(--gold) flex items-center gap-2">
                  <Upload className="w-4 h-4" /> {uploading ? "Uploading…" : (editing.url ? "Replace video file" : "Upload video file")}
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadVideoFile(e.target.files[0])} />
                </label>
                {editing.url && <p className="text-[10px] text-(--ivory)/50 mt-2 truncate">{editing.url}</p>}
              </div>
            )}
            <TextField label="Tag (e.g. Teaser, Recap)" value={editing.tag ?? ""} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} />
            <ImageUpload label="Thumbnail (optional)" folder="video-thumbs" value={editing.thumbnail_url} onChange={(url) => setEditing({ ...editing, thumbnail_url: url })} />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setEditing(null)} className="text-(--ivory)/70 text-xs uppercase tracking-[0.2em]">Cancel</button>
            <GoldButton onClick={() => save.mutate(editing)} disabled={save.isPending}>Save</GoldButton>
          </div>
        </Modal>
      )}
    </Panel>
  );
}

/* ============== SPONSORS ============== */

function SponsorsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("sponsors") as any)
        .select("*")
        .order("tier", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("name");
      if (error) {
        if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("sponsors")) return DEFAULT_SPONSORS;
        throw error;
      }
      return withDefaultSponsors(data);
    },
  });
  const [editing, setEditing] = useState<any | null>(null);

  const save = useMutation({
    mutationFn: async (s: any) => {
      const payload = {
        name: s.name,
        tier: s.tier ?? "community",
        logo_url: s.logo_url || null,
        description: s.description || null,
        link_url: s.link_url || null,
        sort_order: s.sort_order ? Number(s.sort_order) : 100,
        is_visible: s.is_visible ?? true,
      };
      if (isSupabaseId(s.id)) {
        const { error } = await (supabase.from("sponsors") as any).update(payload).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("sponsors") as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Sponsor saved.");
      qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
      qc.invalidateQueries({ queryKey: ["sponsors"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("sponsors") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Sponsor deleted.");
      qc.invalidateQueries({ queryKey: ["admin-sponsors"] });
      qc.invalidateQueries({ queryKey: ["sponsors"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Panel
      title="Sponsors"
      action={<GoldButton onClick={() => setEditing({ name: "", tier: "community", sort_order: 100, is_visible: true })}><Plus className="w-4 h-4" /> New Sponsor</GoldButton>}
    >
      <div className="space-y-3">
        {data.map((s: any) => (
          <div key={s.id} className="p-4 rounded-lg border border-(--gold)/15 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {s.logo_url ? (
                <img src={s.logo_url} alt="" className="w-14 h-14 rounded-lg object-contain bg-(--emerald-deep) ring-1 ring-(--gold)/25" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-(--secondary) ring-1 ring-(--gold)/25" />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-(--gold-soft)/70">
                  <span>{s.tier}</span>
                  {!s.is_visible && <span className="text-(--ivory)/45">Hidden</span>}
                </div>
                <div className="font-display text-lg text-(--ivory) truncate">{s.name}</div>
                {s.description && <p className="text-sm text-(--ivory)/65 line-clamp-1">{s.description}</p>}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(s)} className="text-(--gold-soft) p-2"><Edit3 className="w-4 h-4" /></button>
              {isSupabaseId(s.id) && <button onClick={() => confirm(`Delete ${s.name}?`) && del.mutate(s.id)} className="text-(--destructive) p-2"><Trash2 className="w-4 h-4" /></button>}
            </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-center text-(--ivory)/50 italic py-8">No sponsors yet. Add logos and partner names here.</p>}
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h3 className="font-display text-2xl text-gold-gradient mb-2">{isSupabaseId(editing.id) ? "Edit" : "New"} Sponsor</h3>
          <GoldDivider />
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField label="Sponsor Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <Select label="Sponsor Tier" value={editing.tier ?? "community"} onChange={(e) => setEditing({ ...editing, tier: e.target.value })}>
                <option value="major">Major Sponsor</option>
                <option value="partner">Official Partner</option>
                <option value="community">Community Supporter</option>
              </Select>
              <TextField label="Sort Order" type="number" value={editing.sort_order ?? 100} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
              <TextField label="Link URL (optional)" value={editing.link_url ?? ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} />
            </div>
            <TextArea label="Description / Tagline (optional)" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            <ImageUpload label="Sponsor Logo" folder="sponsors" value={editing.logo_url} onChange={(url) => setEditing({ ...editing, logo_url: url })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_visible ?? true} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} />
              Show on public website
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setEditing(null)} className="text-(--ivory)/70 text-xs uppercase tracking-[0.2em]">Cancel</button>
            <GoldButton onClick={() => save.mutate(editing)} disabled={save.isPending}>Save</GoldButton>
          </div>
        </Modal>
      )}
    </Panel>
  );
}

/* ============== OFFICIALS & ORGANIZERS ============== */

function OfficialsAdmin() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ["admin-pageant-people"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("pageant_people") as any)
        .select("*")
        .order("group_type", { ascending: true })
        .order("sort_order", { ascending: true })
        .order("name");
      if (error) {
        if (error.code === "42P01" || error.code === "PGRST205" || error.message?.includes("pageant_people")) return DEFAULT_PAGEANT_PEOPLE;
        throw error;
      }
      return withDefaultPageantPeople(data);
    },
  });
  const [editing, setEditing] = useState<any | null>(null);

  const save = useMutation({
    mutationFn: async (person: any) => {
      const payload = {
        group_type: person.group_type ?? "sk",
        name: person.name,
        role: person.role || null,
        photo_url: person.photo_url || null,
        facebook_url: person.facebook_url || null,
        contact_number: person.contact_number || null,
        sort_order: person.sort_order ? Number(person.sort_order) : 100,
        is_visible: person.is_visible ?? true,
      };
      if (isSupabaseId(person.id)) {
        const { error } = await (supabase.from("pageant_people") as any).update(payload).eq("id", person.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("pageant_people") as any).insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Official saved.");
      qc.invalidateQueries({ queryKey: ["admin-pageant-people"] });
      qc.invalidateQueries({ queryKey: ["pageant-people"] });
      setEditing(null);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from("pageant_people") as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Official deleted.");
      qc.invalidateQueries({ queryKey: ["admin-pageant-people"] });
      qc.invalidateQueries({ queryKey: ["pageant-people"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const sk = data.filter((person: any) => person.group_type === "sk");
  const organizers = data.filter((person: any) => person.group_type === "organizer");

  function PeopleList({ title, people }: { title: string; people: any[] }) {
    return (
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-(--gold-soft)/70 mb-3">{title}</h3>
        <div className="space-y-3">
          {people.map((person: any) => (
            <div key={person.id} className="p-4 rounded-lg border border-(--gold)/15 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {person.photo_url ? (
                  <img src={person.photo_url} alt="" className="w-14 h-14 rounded-full object-cover ring-1 ring-(--gold)/25" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-(--secondary) ring-1 ring-(--gold)/25 grid place-items-center text-(--gold-soft) font-display">
                    {person.name?.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-(--gold-soft)/70">
                    <span>{person.role || "Member"}</span>
                    {!person.is_visible && <span className="text-(--ivory)/45">Hidden</span>}
                  </div>
                  <div className="font-display text-lg text-(--ivory) truncate">{person.name}</div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setEditing(person)} className="text-(--gold-soft) p-2"><Edit3 className="w-4 h-4" /></button>
                {isSupabaseId(person.id) && <button onClick={() => confirm(`Delete ${person.name}?`) && del.mutate(person.id)} className="text-(--destructive) p-2"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
          ))}
          {people.length === 0 && <p className="text-(--ivory)/50 italic py-4">No entries yet.</p>}
        </div>
      </div>
    );
  }

  return (
    <Panel
      title="Officials & Organizers"
      action={
        <div className="flex flex-wrap gap-2">
          <GoldButton onClick={() => setEditing({ group_type: "sk", name: "", role: "SK Kagawad", sort_order: (sk.length + 1), is_visible: true })}><Plus className="w-4 h-4" /> SK</GoldButton>
          <GoldButton onClick={() => setEditing({ group_type: "organizer", name: "", role: "Organizer", sort_order: (organizers.length + 1), is_visible: true })}><Plus className="w-4 h-4" /> Organizer</GoldButton>
        </div>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <PeopleList title="SK Officials" people={sk} />
        <PeopleList title="Organizers" people={organizers} />
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <h3 className="font-display text-2xl text-gold-gradient mb-2">{isSupabaseId(editing.id) ? "Edit" : "New"} Entry</h3>
          <GoldDivider />
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select label="Section" value={editing.group_type ?? "sk"} onChange={(e) => setEditing({ ...editing, group_type: e.target.value })}>
                <option value="sk">SK Officials</option>
                <option value="organizer">Organizers</option>
              </Select>
              <TextField label="Sort Order" type="number" value={editing.sort_order ?? 100} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} />
              <TextField label="Name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              <TextField label="Role / Position" value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              <TextField label="Facebook URL" value={editing.facebook_url ?? ""} onChange={(e) => setEditing({ ...editing, facebook_url: e.target.value })} />
              <TextField label="Contact Number" value={editing.contact_number ?? ""} onChange={(e) => setEditing({ ...editing, contact_number: e.target.value })} />
            </div>
            <ImageUpload label="Round Photo" folder="officials" value={editing.photo_url} onChange={(url) => setEditing({ ...editing, photo_url: url })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_visible ?? true} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} />
              Show on public website
            </label>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setEditing(null)} className="text-(--ivory)/70 text-xs uppercase tracking-[0.2em]">Cancel</button>
            <GoldButton onClick={() => save.mutate(editing)} disabled={save.isPending || !editing.name}>Save</GoldButton>
          </div>
        </Modal>
      )}
    </Panel>
  );
}

/* ============== SETTINGS ============== */

function SettingsAdmin() {
  const qc = useQueryClient();
  const { data: settings = {} } = useQuery(settingsQuery);
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const current = draft ?? settings;

  const save = useMutation({
    mutationFn: async (next: Record<string, any>) => {
      const rows = Object.entries(next).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Settings saved."); qc.invalidateQueries({ queryKey: ["settings"] }); setDraft(null); },
    onError: (e: any) => toast.error(e.message),
  });

  function setKey(key: string, value: any) { setDraft({ ...(current as any), [key]: value }); }

  const event = current.event ?? {};
  const about = current.about ?? {};
  const ticket = current.ticket ?? { terms: [] };
  const socials = current.socials ?? {};
  const ticketImage = current.ticketImage ?? {};
  const developer = current.developer ?? { label: "Website by", name: "Jien Claude Valancio", is_visible: true };

  return (
    <div className="space-y-6">
      <Panel title="Event Details">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Title" value={event.title ?? ""} onChange={(e) => setKey("event", { ...event, title: e.target.value })} />
          <TextField label="Tagline" value={event.tagline ?? ""} onChange={(e) => setKey("event", { ...event, tagline: e.target.value })} />
          <TextField label="Date (YYYY-MM-DD)" value={event.date ?? ""} onChange={(e) => setKey("event", { ...event, date: e.target.value })} />
          <TextField label="Time" value={event.time ?? ""} onChange={(e) => setKey("event", { ...event, time: e.target.value })} />
          <TextField label="Venue" value={event.venue ?? ""} onChange={(e) => setKey("event", { ...event, venue: e.target.value })} />
        </div>
      </Panel>

      <Panel title="About">
        <TextArea label="Body" value={about.body ?? ""} onChange={(e) => setKey("about", { ...about, body: e.target.value })} />
      </Panel>

      <Panel title="Ticket">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Price (PHP)" type="number" value={ticket.price ?? 50} onChange={(e) => setKey("ticket", { ...ticket, price: Number(e.target.value) })} />
        </div>
        <div className="mt-4">
          <TextArea label="Terms (one per line)" value={(ticket.terms ?? []).join("\n")} onChange={(e) => setKey("ticket", { ...ticket, terms: e.target.value.split("\n").filter(Boolean) })} />
        </div>
        <div className="mt-4">
          <ImageUpload label="Ticket design image" folder="ticket" value={ticketImage.url} onChange={(url) => setKey("ticketImage", { url })} />
        </div>
      </Panel>

      <Panel title="Socials">
        <div className="grid sm:grid-cols-3 gap-4">
          <TextField label="Facebook URL" value={socials.facebook ?? ""} onChange={(e) => setKey("socials", { ...socials, facebook: e.target.value })} />
          <TextField label="Instagram URL" value={socials.instagram ?? ""} onChange={(e) => setKey("socials", { ...socials, instagram: e.target.value })} />
          <TextField label="TikTok URL" value={socials.tiktok ?? ""} onChange={(e) => setKey("socials", { ...socials, tiktok: e.target.value })} />
        </div>
      </Panel>

      <Panel title="Developer Contact">
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Label" value={developer.label ?? ""} onChange={(e) => setKey("developer", { ...developer, label: e.target.value })} />
          <TextField label="Name" value={developer.name ?? ""} onChange={(e) => setKey("developer", { ...developer, name: e.target.value })} />
          <TextField label="Email" value={developer.email ?? ""} onChange={(e) => setKey("developer", { ...developer, email: e.target.value })} />
          <TextField label="Phone / Contact Number" value={developer.phone ?? ""} onChange={(e) => setKey("developer", { ...developer, phone: e.target.value })} />
          <TextField label="Facebook URL" value={developer.facebook ?? ""} onChange={(e) => setKey("developer", { ...developer, facebook: e.target.value })} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={developer.is_visible ?? true} onChange={(e) => setKey("developer", { ...developer, is_visible: e.target.checked })} />
          Show developer contact in footer
        </label>
      </Panel>

      <div className="flex justify-end">
        <GoldButton onClick={() => save.mutate(current)} disabled={!draft || save.isPending}>Save all changes</GoldButton>
      </div>
    </div>
  );
}

/* ============== Modal ============== */

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 lg:p-8"
      onClick={onClose}
    >
      <div
        className="glass-emerald rounded-2xl max-w-2xl w-full mx-auto my-4 sm:my-6 max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto scrollbar-gold p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
