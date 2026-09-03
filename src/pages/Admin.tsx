import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";

/* ---------------- types ---------------- */
type Product = {
  id: number;
  name: string;
  category: "equipment" | "supplements" | "accessories";
  description: string | null;
  pricePkr: number;
  compareAtPkr: number | null;
  mediaType: "image" | "video" | "model3d";
  mediaUrl: string | null;
  embedCode: string | null;
  badge: string | null;
  stock: number;
  featured: boolean;
  sortOrder: number;
  active: boolean;
};

type Ev = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  startAt: string | Date;
  seats: number;
  pricePkr: number;
  status: "upcoming" | "archived";
};

const emptyProduct = {
  name: "",
  category: "equipment" as Product["category"],
  description: "",
  pricePkr: 0,
  compareAtPkr: null as number | null,
  mediaType: "image" as Product["mediaType"],
  mediaUrl: "",
  embedCode: "",
  badge: "",
  stock: 0,
  featured: false,
  sortOrder: 0,
  active: true,
};

const emptyEvent = {
  title: "",
  description: "",
  category: "Workshop",
  location: "AW Flagship Facility — Lahore",
  startAt: "",
  seats: 30,
  pricePkr: 0,
  status: "upcoming" as Ev["status"],
};

function toLocalInput(d: string | Date) {
  const date = new Date(d);
  const off = date.getTimezoneOffset();
  return new Date(date.getTime() - off * 60000).toISOString().slice(0, 16);
}

/* ---------------- component ---------------- */
export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("aw_admin_token") || "");
  const [user, setUser] = useState("admin");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"products" | "events" | "settings">("products");

  const login = trpc.admin.login.useMutation();
  const verify = trpc.admin.verify.useQuery(undefined, {
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (verify.isError) {
      localStorage.removeItem("aw_admin_token");
      setToken("");
    }
  }, [verify.isError]);

  const authed = !!token && verify.isSuccess;

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    try {
      const res = await login.mutateAsync({ username: user, password: pass });
      localStorage.setItem("aw_admin_token", res.token);
      setToken(res.token);
    } catch {
      setErr("Invalid credentials. Try again.");
    }
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
        <form
          onSubmit={doLogin}
          className="w-full max-w-sm border border-white/10 bg-[#0d0d0d] p-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-[#39ff14]/60 font-display text-xl font-black text-[#39ff14]">
              AW
            </span>
            <div>
              <p className="font-display text-lg font-black tracking-[0.2em] text-white">ADMIN</p>
              <p className="font-mono2 text-[9px] tracking-[0.3em] text-neutral-600">
                SECURE CONSOLE
              </p>
            </div>
          </div>
          <label className="mt-8 block">
            <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500">USERNAME</span>
            <input
              className="aw-input mt-1.5"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="mt-4 block">
            <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500">PASSWORD</span>
            <input
              type="password"
              className="aw-input mt-1.5"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {err && <p className="mt-3 text-xs text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={login.isPending || (!!token && verify.isLoading)}
            className="mt-6 w-full bg-[#39ff14] py-3 font-mono2 text-xs font-bold tracking-[0.25em] text-black disabled:opacity-50"
          >
            {login.isPending || (!!token && verify.isLoading) ? "AUTHENTICATING…" : "ENTER CONSOLE"}
          </button>
          <Link
            to="/"
            className="mt-4 block text-center font-mono2 text-[10px] tracking-[0.2em] text-neutral-600 hover:text-[#39ff14]"
          >
            ← BACK TO SITE
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="flex h-9 w-9 items-center justify-center border border-[#39ff14]/60 font-display font-black text-[#39ff14]">
              AW
            </span>
            <div>
              <p className="font-display font-black tracking-[0.2em] text-white">ADMIN CONSOLE</p>
              <p className="font-mono2 text-[9px] tracking-[0.25em] text-neutral-600">
                RATES · PRODUCTS · EVENTS · SETTINGS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500 hover:text-[#39ff14]">
              VIEW SITE →
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem("aw_admin_token");
                setToken("");
              }}
              className="border border-white/15 px-3 py-2 font-mono2 text-[10px] tracking-[0.2em] text-neutral-400 hover:border-red-400 hover:text-red-400"
            >
              LOGOUT
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-px bg-white/10 px-4">
          {(["products", "events", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 font-mono2 text-[10px] tracking-[0.25em] ${
                tab === t ? "bg-[#39ff14] text-black" : "bg-[#0d0d0d] text-neutral-400 hover:text-white"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "products" && <ProductsTab />}
        {tab === "events" && <EventsTab />}
        {tab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}

/* ---------------- Products tab ---------------- */
function ProductsTab() {
  const utils = trpc.useUtils();
  const products = trpc.admin.products.useQuery();
  const create = trpc.admin.createProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });
  const update = trpc.admin.updateProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });
  const del = trpc.admin.deleteProduct.useMutation({ onSuccess: () => utils.admin.products.invalidate() });

  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [priceEdits, setPriceEdits] = useState<Record<number, string>>({});

  const list = (products.data || []) as Product[];

  const openEdit = (p: Product) => {
    setEditing(p);
    setCreating(false);
    setForm({
      name: p.name,
      category: p.category,
      description: p.description || "",
      pricePkr: p.pricePkr,
      compareAtPkr: p.compareAtPkr,
      mediaType: p.mediaType,
      mediaUrl: p.mediaUrl || "",
      embedCode: p.embedCode || "",
      badge: p.badge || "",
      stock: p.stock,
      featured: p.featured,
      sortOrder: p.sortOrder,
      active: p.active,
    });
  };

  const save = async () => {
    const payload = {
      ...form,
      pricePkr: Number(form.pricePkr) || 0,
      compareAtPkr: form.compareAtPkr === null || form.compareAtPkr === ("" as unknown as null) ? null : Number(form.compareAtPkr),
      stock: Number(form.stock) || 0,
      sortOrder: Number(form.sortOrder) || 0,
      badge: form.badge || null,
      embedCode: form.embedCode || null,
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: payload });
    } else {
      await create.mutateAsync(payload);
    }
    setEditing(null);
    setCreating(false);
    setForm(emptyProduct);
  };

  const quickRate = async (p: Product) => {
    const v = priceEdits[p.id];
    if (v === undefined) return;
    await update.mutateAsync({ id: p.id, data: { pricePkr: Number(v) || 0 } });
    setPriceEdits((s) => {
      const n = { ...s };
      delete n[p.id];
      return n;
    });
  };

  const saving = create.isPending || update.isPending;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-black text-white">PRODUCTS & PKR RATES</h2>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setForm(emptyProduct);
          }}
          className="bg-[#39ff14] px-4 py-2 font-mono2 text-[10px] font-bold tracking-[0.2em] text-black"
        >
          + NEW PRODUCT
        </button>
      </div>

      {(creating || editing) && (
        <div className="mt-6 border border-[#39ff14]/40 bg-[#0d0d0d] p-6">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#39ff14]">
            {editing ? `EDITING #${editing.id}` : "CREATE PRODUCT"}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="font-mono2 text-[10px] text-neutral-500">NAME</span>
              <input className="aw-input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">CATEGORY</span>
              <select className="aw-input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })}>
                <option value="equipment">equipment</option>
                <option value="supplements">supplements</option>
                <option value="accessories">accessories</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">MEDIA TYPE</span>
              <select className="aw-input mt-1" value={form.mediaType} onChange={(e) => setForm({ ...form, mediaType: e.target.value as Product["mediaType"] })}>
                <option value="image">image</option>
                <option value="video">video</option>
                <option value="model3d">model3d (Sketchfab embed)</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">PRICE (PKR)</span>
              <input type="number" className="aw-input mt-1" value={form.pricePkr} onChange={(e) => setForm({ ...form, pricePkr: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">COMPARE-AT (PKR, optional)</span>
              <input type="number" className="aw-input mt-1" value={form.compareAtPkr ?? ""} onChange={(e) => setForm({ ...form, compareAtPkr: e.target.value === "" ? null : Number(e.target.value) })} />
            </label>
            <label className="block md:col-span-2">
              <span className="font-mono2 text-[10px] text-neutral-500">MEDIA URL (/assets/…)</span>
              <input className="aw-input mt-1" value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} />
            </label>
            {form.mediaType === "model3d" && (
              <label className="block md:col-span-2">
                <span className="font-mono2 text-[10px] text-neutral-500">3D EMBED CODE (iframe)</span>
                <textarea className="aw-input mt-1" rows={3} value={form.embedCode} onChange={(e) => setForm({ ...form, embedCode: e.target.value })} />
              </label>
            )}
            <label className="block md:col-span-2">
              <span className="font-mono2 text-[10px] text-neutral-500">DESCRIPTION</span>
              <textarea className="aw-input mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">BADGE (optional)</span>
              <input className="aw-input mt-1" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">STOCK</span>
              <input type="number" className="aw-input mt-1" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">SORT ORDER</span>
              <input type="number" className="aw-input mt-1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </label>
            <div className="flex items-end gap-6 pb-1">
              <label className="flex items-center gap-2 text-xs text-neutral-400">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
              <label className="flex items-center gap-2 text-xs text-neutral-400">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Active (visible)
              </label>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={save} disabled={saving || !form.name} className="bg-[#39ff14] px-6 py-2.5 font-mono2 text-[10px] font-bold tracking-[0.2em] text-black disabled:opacity-40">
              {saving ? "SAVING…" : "SAVE PRODUCT"}
            </button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="border border-white/15 px-6 py-2.5 font-mono2 text-[10px] tracking-[0.2em] text-neutral-400">
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 overflow-x-auto border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#111] font-mono2 text-[9px] tracking-[0.2em] text-neutral-500">
            <tr>
              <th className="px-4 py-3">PRODUCT</th>
              <th className="px-4 py-3">CATEGORY</th>
              <th className="px-4 py-3">PRICE (PKR)</th>
              <th className="px-4 py-3">QUICK RATE UPDATE</th>
              <th className="px-4 py-3">STOCK</th>
              <th className="px-4 py-3">STATUS</th>
              <th className="px-4 py-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="max-w-[280px] truncate font-semibold text-white">{p.name}</p>
                  <p className="font-mono2 text-[9px] text-neutral-600">#{p.id} · {p.mediaType}</p>
                </td>
                <td className="px-4 py-3 font-mono2 text-[11px] text-neutral-400">{p.category}</td>
                <td className="px-4 py-3">
                  <span className="font-display font-black text-[#39ff14]">Rs {p.pricePkr.toLocaleString("en-PK")}</span>
                  {p.compareAtPkr && (
                    <span className="ml-2 font-mono2 text-[10px] text-neutral-600 line-through">
                      {p.compareAtPkr.toLocaleString("en-PK")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={String(p.pricePkr)}
                      value={priceEdits[p.id] ?? ""}
                      onChange={(e) => setPriceEdits((s) => ({ ...s, [p.id]: e.target.value }))}
                      className="aw-input w-28 py-1.5"
                    />
                    <button
                      onClick={() => quickRate(p)}
                      disabled={priceEdits[p.id] === undefined || update.isPending}
                      className="bg-[#39ff14] px-3 py-1.5 font-mono2 text-[10px] font-bold text-black disabled:opacity-30"
                    >
                      SET
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono2 text-[11px] text-neutral-400">{p.stock}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => update.mutate({ id: p.id, data: { active: !p.active } })}
                    className={`font-mono2 text-[10px] ${p.active ? "text-[#39ff14]" : "text-neutral-600"}`}
                  >
                    {p.active ? "● LIVE" : "○ HIDDEN"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEdit(p)} className="border border-white/15 px-3 py-1.5 font-mono2 text-[10px] text-neutral-300 hover:border-[#39ff14] hover:text-[#39ff14]">
                      EDIT
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"?`)) del.mutate({ id: p.id });
                      }}
                      className="border border-white/15 px-3 py-1.5 font-mono2 text-[10px] text-neutral-300 hover:border-red-400 hover:text-red-400"
                    >
                      DEL
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Events tab ---------------- */
function EventsTab() {
  const utils = trpc.useUtils();
  const events = trpc.admin.events.useQuery();
  const create = trpc.admin.createEvent.useMutation({ onSuccess: () => utils.admin.events.invalidate() });
  const update = trpc.admin.updateEvent.useMutation({ onSuccess: () => utils.admin.events.invalidate() });
  const del = trpc.admin.deleteEvent.useMutation({ onSuccess: () => utils.admin.events.invalidate() });

  const [editing, setEditing] = useState<Ev | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyEvent);
  const list = useMemo(() => (events.data || []) as Ev[], [events.data]);

  const openEdit = (ev: Ev) => {
    setEditing(ev);
    setCreating(false);
    setForm({
      title: ev.title,
      description: ev.description || "",
      category: ev.category || "Workshop",
      location: ev.location || "",
      startAt: toLocalInput(ev.startAt),
      seats: ev.seats,
      pricePkr: ev.pricePkr,
      status: ev.status,
    });
  };

  const save = async () => {
    const payload = {
      ...form,
      startAt: new Date(form.startAt),
      seats: Number(form.seats) || 0,
      pricePkr: Number(form.pricePkr) || 0,
    };
    if (editing) await update.mutateAsync({ id: editing.id, data: payload });
    else await create.mutateAsync(payload);
    setEditing(null);
    setCreating(false);
    setForm(emptyEvent);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-black text-white">EVENTS & COURSES MANAGER</h2>
        <button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setForm(emptyEvent);
          }}
          className="bg-[#39ff14] px-4 py-2 font-mono2 text-[10px] font-bold tracking-[0.2em] text-black"
        >
          + NEW EVENT
        </button>
      </div>

      {(creating || editing) && (
        <div className="mt-6 border border-[#39ff14]/40 bg-[#0d0d0d] p-6">
          <p className="font-mono2 text-[10px] tracking-[0.3em] text-[#39ff14]">
            {editing ? `EDITING #${editing.id}` : "CREATE EVENT"}
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="font-mono2 text-[10px] text-neutral-500">TITLE</span>
              <input className="aw-input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label className="block md:col-span-2">
              <span className="font-mono2 text-[10px] text-neutral-500">DESCRIPTION</span>
              <textarea className="aw-input mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">CATEGORY</span>
              <input className="aw-input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">LOCATION</span>
              <input className="aw-input mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">START DATE & TIME</span>
              <input type="datetime-local" className="aw-input mt-1" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">STATUS</span>
              <select className="aw-input mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Ev["status"] })}>
                <option value="upcoming">upcoming</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">SEATS</span>
              <input type="number" className="aw-input mt-1" value={form.seats} onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })} />
            </label>
            <label className="block">
              <span className="font-mono2 text-[10px] text-neutral-500">FEE (PKR, 0 = free)</span>
              <input type="number" className="aw-input mt-1" value={form.pricePkr} onChange={(e) => setForm({ ...form, pricePkr: Number(e.target.value) })} />
            </label>
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={save} disabled={create.isPending || update.isPending || !form.title || !form.startAt} className="bg-[#39ff14] px-6 py-2.5 font-mono2 text-[10px] font-bold tracking-[0.2em] text-black disabled:opacity-40">
              SAVE EVENT
            </button>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="border border-white/15 px-6 py-2.5 font-mono2 text-[10px] tracking-[0.2em] text-neutral-400">
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {list.map((ev) => (
          <div key={ev.id} className="flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-[#0d0d0d] p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="truncate font-display font-bold text-white">{ev.title}</p>
                <span className={`shrink-0 px-2 py-0.5 font-mono2 text-[9px] tracking-[0.2em] ${ev.status === "upcoming" ? "bg-[#39ff14]/15 text-[#39ff14]" : "bg-white/10 text-neutral-500"}`}>
                  {ev.status.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 font-mono2 text-[10px] text-neutral-500">
                {new Date(ev.startAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Karachi" })} PKT · {ev.seats} seats · {ev.pricePkr > 0 ? `Rs ${ev.pricePkr.toLocaleString("en-PK")}` : "Free"}
              </p>
            </div>
            <div className="flex gap-2">
              {ev.status === "upcoming" ? (
                <button onClick={() => update.mutate({ id: ev.id, data: { status: "archived" } })} className="border border-white/15 px-3 py-1.5 font-mono2 text-[10px] text-neutral-300 hover:border-yellow-400 hover:text-yellow-400">
                  ARCHIVE
                </button>
              ) : (
                <button onClick={() => update.mutate({ id: ev.id, data: { status: "upcoming" } })} className="border border-white/15 px-3 py-1.5 font-mono2 text-[10px] text-neutral-300 hover:border-[#39ff14] hover:text-[#39ff14]">
                  RESTORE
                </button>
              )}
              <button onClick={() => openEdit(ev)} className="border border-white/15 px-3 py-1.5 font-mono2 text-[10px] text-neutral-300 hover:border-[#39ff14] hover:text-[#39ff14]">
                EDIT
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete "${ev.title}"?`)) del.mutate({ id: ev.id });
                }}
                className="border border-white/15 px-3 py-1.5 font-mono2 text-[10px] text-neutral-300 hover:border-red-400 hover:text-red-400"
              >
                DEL
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Settings tab ---------------- */
function SettingsTab() {
  const utils = trpc.useUtils();
  const settings = trpc.admin.settings.useQuery();
  const update = trpc.admin.updateSettings.useMutation({
    onSuccess: () => {
      utils.admin.settings.invalidate();
      utils.store.settings.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ whatsappNumber: "", usdRate: "", aedRate: "", announcement: "", newPassword: "" });

  useEffect(() => {
    if (settings.data) {
      setForm((f) => ({
        ...f,
        whatsappNumber: settings.data.whatsappNumber,
        usdRate: settings.data.usdRate,
        aedRate: settings.data.aedRate,
        announcement: settings.data.announcement,
      }));
    }
  }, [settings.data]);

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-xl font-black text-white">GLOBAL SETTINGS</h2>
      <p className="mt-2 text-xs leading-relaxed text-neutral-500">
        These values drive the whole site instantly — WhatsApp hand-off number, currency
        conversion rates, and the top announcement bar.
      </p>
      <div className="mt-6 space-y-5 border border-white/10 bg-[#0d0d0d] p-6">
        <label className="block">
          <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500">WHATSAPP NUMBER (international format, no +)</span>
          <input className="aw-input mt-1.5" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500">USD RATE (PKR per $1)</span>
            <input type="number" step="0.1" className="aw-input mt-1.5" value={form.usdRate} onChange={(e) => setForm({ ...form, usdRate: e.target.value })} />
          </label>
          <label className="block">
            <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500">AED RATE (PKR per د.إ1)</span>
            <input type="number" step="0.1" className="aw-input mt-1.5" value={form.aedRate} onChange={(e) => setForm({ ...form, aedRate: e.target.value })} />
          </label>
        </div>
        <label className="block">
          <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500">ANNOUNCEMENT BAR (empty = hidden)</span>
          <input className="aw-input mt-1.5" value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} />
        </label>
        <label className="block">
          <span className="font-mono2 text-[10px] tracking-[0.2em] text-neutral-500">NEW ADMIN PASSWORD (leave empty to keep current)</span>
          <input type="password" className="aw-input mt-1.5" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="••••••••" />
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              update.mutate({
                whatsappNumber: form.whatsappNumber,
                usdRate: form.usdRate,
                aedRate: form.aedRate,
                announcement: form.announcement,
                newPassword: form.newPassword || undefined,
              })
            }
            disabled={update.isPending}
            className="bg-[#39ff14] px-8 py-3 font-mono2 text-[10px] font-bold tracking-[0.25em] text-black disabled:opacity-40"
          >
            {update.isPending ? "SAVING…" : "SAVE SETTINGS"}
          </button>
          {saved && <span className="font-mono2 text-[10px] tracking-[0.2em] text-[#39ff14]">✓ SAVED — LIVE ON SITE</span>}
        </div>
      </div>
    </div>
  );
}
