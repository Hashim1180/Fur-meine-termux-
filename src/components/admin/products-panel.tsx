"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Pencil,
  Plus,
  Trash2,
  Save,
  Package,
  Upload,
  DollarSign,
  Check,
  X,
  Star,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { useAdmin } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import type { MediaDTO, ProductDTO } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EASE = [0.2, 0.8, 0.2, 1] as const

const CATS = ["Supplements", "Accessories", "Cardio", "Strength", "Apparel", "Recovery"]

type Form = Partial<ProductDTO> & { badgesInput?: string }

const empty: Form = {
  name: "",
  category: "Supplements",
  tagline: "",
  description: "",
  pricePKR: 0,
  badgesInput: "",
  image: "",
  video: "",
  model3d: "",
  rating: 5,
  featured: false,
  inStock: true,
}

export default function ProductsPanel() {
  const qc = useQueryClient()
  const setAuthed = useAdmin((s) => s.setAuthed)
  const { toast } = useToast()
  const [editing, setEditing] = useState<ProductDTO | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Form>(empty)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState("")
  const [rateEdit, setRateEdit] = useState<{ id: string; value: string } | null>(null)

  // listen for cmdk "Bulk sync" action
  useEffect(() => {
    const onOpen = () => setBulkOpen(true)
    window.addEventListener("aw:open-bulk", onOpen)
    return () => window.removeEventListener("aw:open-bulk", onOpen)
  }, [])

  const q = useQuery<ProductDTO[]>({
    queryKey: ["admin", "products"],
    queryFn: () => api.admin.products(),
    retry: false,
  })

  const mediaQ = useQuery<MediaDTO[]>({
    queryKey: ["admin", "media"],
    queryFn: () => api.admin.media(),
    retry: false,
  })

  useEffect(() => {
    if (q.isError) setAuthed(false)
  }, [q.isError, setAuthed])

  const photos = useMemo(() => (mediaQ.data ?? []).filter((m) => m.type === "photo"), [mediaQ.data])
  const videos = useMemo(() => (mediaQ.data ?? []).filter((m) => m.type === "video"), [mediaQ.data])

  const saveMut = useMutation({
    mutationFn: (p: Partial<ProductDTO> & { id?: string }) => api.admin.saveProduct(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] })
      qc.invalidateQueries({ queryKey: ["admin", "telemetry"] })
      qc.invalidateQueries({ queryKey: ["public", "products"] })
      toast({ title: "Product saved", description: "Inventory updated." })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    },
  })

  const delMut = useMutation({
    mutationFn: (id: string) => api.admin.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] })
      qc.invalidateQueries({ queryKey: ["admin", "telemetry"] })
      toast({ title: "Product deleted" })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
    },
  })

  const bulkMut = useMutation({
    mutationFn: (text: string) => api.admin.bulkSync(text),
    onSuccess: (r: { created: number; updated: number; skipped: number; total: number }) => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] })
      qc.invalidateQueries({ queryKey: ["admin", "telemetry"] })
      toast({
        title: "Bulk sync complete",
        description: `${r.created} created · ${r.updated} updated · ${r.skipped} skipped`,
      })
      setBulkOpen(false)
      setBulkText("")
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
      toast({ title: "Sync failed", description: e.message, variant: "destructive" })
    },
  })

  const openEdit = (p: ProductDTO) => {
    setEditing(p)
    setForm({
      ...p,
      badgesInput: Array.isArray(p.badges) ? p.badges.join(", ") : "",
    })
  }

  const openCreate = () => {
    setCreating(true)
    setForm({ ...empty })
  }

  const submitForm = () => {
    const payload: Partial<ProductDTO> & { id?: string } = {
      name: form.name || "Untitled",
      category: form.category || "Supplements",
      tagline: form.tagline ?? "",
      description: form.description ?? "",
      pricePKR: Number(form.pricePKR ?? 0),
      badges: (form.badgesInput ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      image: form.image ?? "",
      video: form.video ?? "",
      model3d: form.model3d ?? "",
      rating: Number(form.rating ?? 5),
      featured: !!form.featured,
      inStock: form.inStock ?? true,
    }
    if (editing) payload.id = editing.id
    saveMut.mutate(payload)
    setEditing(null)
    setCreating(false)
  }

  const commitRate = (p: ProductDTO, val: string) => {
    const n = Number(val)
    if (!isNaN(n) && n !== p.pricePKR) {
      saveMut.mutate({ id: p.id, pricePKR: n })
    }
    setRateEdit(null)
  }

  const products = q.data ?? []

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
            PRODUCT INVENTORY
          </div>
          <h1 className="mt-1 font-sans text-3xl font-black tracking-cinema text-white sm:text-4xl">
            PRODUCTS <span className="text-gradient-neon">/ CATALOG</span>
          </h1>
          <p className="mt-1 font-mono text-[11px] tracking-wide-2 text-white/45">
            {products.length} items · click a price to edit inline
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setBulkOpen(true)}
            className="h-9 gap-2 border-white/10 bg-white/[0.03] font-mono text-[10px] tracking-mega text-white/70 hover:text-[var(--neon)]"
          >
            <Upload className="size-3.5" /> BULK SYNC
          </Button>
          <Button
            onClick={openCreate}
            className="h-9 gap-2 bg-[var(--neon)] text-[var(--obsidian)] font-mono text-[10px] tracking-mega hover:bg-[var(--neon)]/90"
          >
            <Plus className="size-3.5" /> ADD PRODUCT
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        className="glass overflow-hidden rounded-xl"
      >
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[var(--charcoal)]/90 backdrop-blur">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">NAME</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">CATEGORY</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">PRICE (PKR)</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">FEATURED</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">STOCK</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">RATING</TableHead>
                <TableHead className="text-right font-mono text-[10px] tracking-mega text-white/45">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="border-white/5">
                  <TableCell className="max-w-[200px]">
                    <div className="flex items-center gap-2.5">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="size-9 shrink-0 rounded-md object-cover ring-1 ring-white/10"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/5">
                          <Package className="size-4 text-white/30" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-white">{p.name}</div>
                        <div className="truncate font-mono text-[10px] text-white/40">{p.tagline}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[11px] tracking-wide-2 text-white/65">{p.category}</span>
                  </TableCell>
                  <TableCell>
                    {rateEdit?.id === p.id ? (
                      <Input
                        autoFocus
                        value={rateEdit.value}
                        onChange={(e) => setRateEdit({ ...rateEdit, value: e.target.value })}
                        onBlur={() => commitRate(p, rateEdit.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRate(p, rateEdit.value)
                          if (e.key === "Escape") setRateEdit(null)
                        }}
                        className="h-7 w-28 font-mono text-xs"
                        inputMode="numeric"
                      />
                    ) : (
                      <button
                        onClick={() => setRateEdit({ id: p.id, value: String(p.pricePKR) })}
                        className="group inline-flex items-center gap-1.5 rounded px-1 py-0.5 font-mono text-xs tabular-nums text-white/85 hover:bg-white/5"
                        title="Click to edit price"
                      >
                        Rs {new Intl.NumberFormat("en-PK").format(p.pricePKR)}
                        <Pencil className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    {p.featured ? (
                      <Badge className="border-[var(--neon)]/40 bg-[var(--neon)]/10 text-[var(--neon)]">
                        <Star className="size-2.5" /> FEATURED
                      </Badge>
                    ) : (
                      <span className="font-mono text-[10px] text-white/30">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-mono text-[10px] tracking-wide-2 ${p.inStock ? "text-[var(--neon)]" : "text-[var(--crimson)]"}`}
                    >
                      {p.inStock ? "IN STOCK" : "OUT"}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums text-white/70">
                    {p.rating.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-white/50 hover:text-[var(--neon)]"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-white/50 hover:text-[var(--crimson)]"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-strong border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete product?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/55">
                              This will permanently remove <span className="text-[var(--neon)]">{p.name}</span> from
                              the catalog.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/10 bg-white/5 text-white/70">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson)]/90"
                              onClick={() => delMut.mutate(p.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center font-mono text-[11px] text-white/35">
                    {q.isLoading ? "Loading…" : "No products. Add one or bulk-sync a CSV."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* edit / create dialog */}
      <Dialog
        open={!!editing || creating}
        onOpenChange={(o) => {
          if (!o) {
            setEditing(null)
            setCreating(false)
          }
        }}
      >
        <DialogContent className="glass-strong max-h-[calc(100vh-4rem)] max-w-2xl overflow-y-auto border-white/10 p-0">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[var(--charcoal)]/90 p-5 backdrop-blur">
            <div>
              <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
                {editing ? "EDIT PRODUCT" : "NEW PRODUCT"}
              </div>
              <DialogTitle className="mt-1 font-sans text-xl font-bold tracking-cinema text-white">
                {editing ? editing.name : "Create product"}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="sr-only">Edit product fields and save.</DialogDescription>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="NAME" className="sm:col-span-2">
              <Input
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10"
                placeholder="ON Gold Standard Whey 5lb"
              />
            </Field>

            <Field label="CATEGORY">
              <Select
                value={form.category ?? "Supplements"}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="PRICE (PKR)">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/40" />
                <Input
                  type="number"
                  value={form.pricePKR ?? 0}
                  onChange={(e) => setForm({ ...form, pricePKR: Number(e.target.value) })}
                  className="h-10 pl-8 font-mono tabular-nums"
                />
              </div>
            </Field>

            <Field label="TAGLINE" className="sm:col-span-2">
              <Input
                value={form.tagline ?? ""}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="h-10"
                placeholder="24g protein per scoop"
              />
            </Field>

            <Field label="DESCRIPTION" className="sm:col-span-2">
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Multi-phrase marketing copy..."
              />
            </Field>

            <Field label="BADGES (comma-separated)" className="sm:col-span-2">
              <Input
                value={form.badgesInput ?? ""}
                onChange={(e) => setForm({ ...form, badgesInput: e.target.value })}
                className="h-10"
                placeholder="Best Seller, Authentic, Imported"
              />
            </Field>

            <Field label="IMAGE (photo)">
              <Select value={form.image ?? ""} onValueChange={(v) => setForm({ ...form, image: v })}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="— none —" />
                </SelectTrigger>
                <SelectContent>
                  {photos.length === 0 && (
                    <SelectItem value="" disabled>
                      No photos uploaded
                    </SelectItem>
                  )}
                  {photos.map((m) => (
                    <SelectItem key={m.id} value={m.path}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="VIDEO (showcase)">
              <Select value={form.video ?? ""} onValueChange={(v) => setForm({ ...form, video: v })}>
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="— none —" />
                </SelectTrigger>
                <SelectContent>
                  {videos.length === 0 && (
                    <SelectItem value="" disabled>
                      No videos uploaded
                    </SelectItem>
                  )}
                  {videos.map((m) => (
                    <SelectItem key={m.id} value={m.path}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="3D MODEL URL (optional)" className="sm:col-span-2">
              <Input
                value={form.model3d ?? ""}
                onChange={(e) => setForm({ ...form, model3d: e.target.value })}
                className="h-10"
                placeholder="https://sketchfab.com/..."
              />
            </Field>

            <Field label="RATING (0–5)">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={form.rating ?? 5}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="h-10 font-mono"
              />
            </Field>

            <div className="flex items-end gap-6 sm:col-span-2">
              <Toggle
                label="FEATURED"
                checked={!!form.featured}
                onCheckedChange={(v) => setForm({ ...form, featured: v })}
              />
              <Toggle
                label="IN STOCK"
                checked={!!form.inStock}
                onCheckedChange={(v) => setForm({ ...form, inStock: v })}
              />
            </div>
          </div>

          <DialogFooter className="border-t border-white/10 bg-[var(--charcoal)]/50 p-5">
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null)
                setCreating(false)
              }}
              className="text-white/60 hover:text-white"
            >
              <X className="size-4" /> Cancel
            </Button>
            <Button
              onClick={submitForm}
              disabled={saveMut.isPending || !form.name}
              className="gap-2 bg-[var(--neon)] text-[var(--obsidian)] font-mono text-[10px] tracking-mega hover:bg-[var(--neon)]/90 disabled:opacity-40"
            >
              <Save className="size-3.5" /> {saveMut.isPending ? "SAVING…" : "SAVE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* bulk sync sheet */}
      <Sheet open={bulkOpen} onOpenChange={setBulkOpen}>
        <SheetContent side="right" className="glass-strong w-full border-white/10 sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-sans text-xl font-bold tracking-cinema text-white">
              Bulk sync <span className="text-gradient-neon">CSV</span>
            </SheetTitle>
            <SheetDescription className="font-mono text-[11px] text-white/45">
              Paste product rows. Existing products match by name and update; new ones are created.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-3 px-4">
            <div className="rounded-md border border-white/10 bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-white/45">
              <div className="mb-1 text-[var(--neon)]/80">FORMAT</div>
              <pre className="whitespace-pre-wrap">
                name,category,pricePKR,tagline,description,badges,rating{"\n"}
                ON Whey 5lb,Supplements,36855,24g protein,Authentic whey,Best Seller|Imported,4.8
              </pre>
            </div>
            <Textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={10}
              placeholder={"name,category,pricePKR,tagline\n..."}
              className="font-mono text-xs"
            />
          </div>
          <SheetFooter>
            <Button
              variant="ghost"
              onClick={() => setBulkOpen(false)}
              className="text-white/60 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => bulkMut.mutate(bulkText)}
              disabled={bulkMut.isPending || !bulkText.trim()}
              className="gap-2 bg-[var(--neon)] text-[var(--obsidian)] font-mono text-[10px] tracking-mega hover:bg-[var(--neon)]/90 disabled:opacity-40"
            >
              <Check className="size-3.5" /> {bulkMut.isPending ? "PARSING…" : "PARSE & SYNC"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 font-mono text-[10px] tracking-mega text-white/45">{label}</Label>
      {children}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      <span className="font-mono text-[10px] tracking-mega text-white/55">{label}</span>
    </div>
  )
}
