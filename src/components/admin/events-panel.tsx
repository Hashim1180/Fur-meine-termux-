"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Pencil,
  Plus,
  Trash2,
  Save,
  X,
  CalendarDays,
  Archive,
  MapPin,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { useAdmin } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import type { EventDTO } from "@/lib/types"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EASE = [0.2, 0.8, 0.2, 1] as const

type Form = Partial<EventDTO>

const empty: Form = {
  title: "",
  subtitle: "",
  description: "",
  location: "Lahore · Gulberg Flagship",
  capacity: 20,
  enrolled: 0,
  durationDays: 15,
  startDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  endDate: new Date(Date.now() + 22 * 86400000).toISOString(),
  accent: "neon",
  archived: false,
}

function dateInputValue(iso: string) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

export default function EventsPanel() {
  const qc = useQueryClient()
  const setAuthed = useAdmin((s) => s.setAuthed)
  const { toast } = useToast()
  const [editing, setEditing] = useState<EventDTO | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<Form>(empty)

  const q = useQuery<EventDTO[]>({
    queryKey: ["admin", "events"],
    queryFn: () => api.admin.events(),
    retry: false,
  })

  useEffect(() => {
    if (q.isError) setAuthed(false)
  }, [q.isError, setAuthed])

  const saveMut = useMutation({
    mutationFn: (e: Partial<EventDTO> & { id?: string }) => api.admin.saveEvent(e),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] })
      qc.invalidateQueries({ queryKey: ["admin", "telemetry"] })
      qc.invalidateQueries({ queryKey: ["public", "events"] })
      toast({ title: "Event saved" })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
      toast({ title: "Save failed", description: e.message, variant: "destructive" })
    },
  })

  const delMut = useMutation({
    mutationFn: (id: string) => api.admin.deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] })
      toast({ title: "Event deleted" })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
    },
  })

  const openEdit = (e: EventDTO) => {
    setEditing(e)
    setForm({ ...e })
  }
  const openCreate = () => {
    setCreating(true)
    setForm({ ...empty })
  }

  const submitForm = () => {
    const payload: Partial<EventDTO> & { id?: string } = {
      title: form.title || "Untitled Event",
      subtitle: form.subtitle ?? "",
      description: form.description ?? "",
      location: form.location ?? "Lahore · Gulberg Flagship",
      capacity: Number(form.capacity ?? 20),
      enrolled: Number(form.enrolled ?? 0),
      durationDays: Number(form.durationDays ?? 15),
      startDate: new Date(form.startDate ?? Date.now()).toISOString(),
      endDate: new Date(form.endDate ?? Date.now()).toISOString(),
      accent: (form.accent as EventDTO["accent"]) ?? "neon",
      archived: !!form.archived,
    }
    if (editing) payload.id = editing.id
    saveMut.mutate(payload)
    setEditing(null)
    setCreating(false)
  }

  const events = q.data ?? []
  const accentColor = (a: string) =>
    a === "gold" ? "var(--gold)" : a === "crimson" ? "var(--crimson)" : "var(--neon)"

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
            EVENT SCHEDULE
          </div>
          <h1 className="mt-1 font-sans text-3xl font-black tracking-cinema text-white sm:text-4xl">
            EVENTS <span className="text-gradient-neon">/ PROGRAMS</span>
          </h1>
          <p className="mt-1 font-mono text-[11px] tracking-wide-2 text-white/45">
            {events.length} events · {events.filter((e) => !e.archived).length} live
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 gap-2 bg-[var(--neon)] text-[var(--obsidian)] font-mono text-[10px] tracking-mega hover:bg-[var(--neon)]/90"
        >
          <Plus className="size-3.5" /> ADD EVENT
        </Button>
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
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">TITLE</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">LOCATION</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">START</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">END</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">SEATS</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">ACCENT</TableHead>
                <TableHead className="font-mono text-[10px] tracking-mega text-white/45">STATUS</TableHead>
                <TableHead className="text-right font-mono text-[10px] tracking-mega text-white/45">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((e) => (
                <TableRow key={e.id} className="border-white/5">
                  <TableCell className="max-w-[220px]">
                    <div className="truncate text-sm font-medium text-white">{e.title}</div>
                    {e.subtitle && (
                      <div className="truncate font-mono text-[10px] text-white/40">{e.subtitle}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-white/65">
                      <MapPin className="size-3 text-white/40" />
                      {e.location}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] tabular-nums text-white/70">
                    {new Date(e.startDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] tabular-nums text-white/70">
                    {new Date(e.endDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-[11px] tabular-nums text-white/70">
                    {e.enrolled}/{e.capacity}
                  </TableCell>
                  <TableCell>
                    <span
                      className="inline-flex size-5 items-center justify-center rounded-md border text-[10px] font-bold"
                      style={{
                        color: accentColor(e.accent),
                        borderColor: `${accentColor(e.accent)}55`,
                        background: `${accentColor(e.accent)}10`,
                      }}
                    >
                      ●
                    </span>
                  </TableCell>
                  <TableCell>
                    {e.archived ? (
                      <Badge className="border-white/15 bg-white/5 text-white/50">ARCHIVED</Badge>
                    ) : (
                      <Badge className="border-[var(--neon)]/40 bg-[var(--neon)]/10 text-[var(--neon)]">
                        LIVE
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-white/50 hover:text-[var(--neon)]"
                        onClick={() => openEdit(e)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-white/50 hover:text-[var(--gold)]"
                        title={e.archived ? "Unarchive" : "Archive"}
                        onClick={() =>
                          saveMut.mutate({ id: e.id, archived: !e.archived })
                        }
                      >
                        <Archive className="size-3.5" />
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
                            <AlertDialogTitle className="text-white">Delete event?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/55">
                              Permanently remove <span className="text-[var(--neon)]">{e.title}</span>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/10 bg-white/5 text-white/70">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson)]/90"
                              onClick={() => delMut.mutate(e.id)}
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
              {events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center font-mono text-[11px] text-white/35">
                    {q.isLoading ? "Loading…" : "No events scheduled."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* edit / create */}
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
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[var(--charcoal)]/90 p-5 backdrop-blur">
            <div className="font-mono text-[10px] tracking-mega text-[var(--neon)]/80">
              {editing ? "EDIT EVENT" : "NEW EVENT"}
            </div>
            <DialogTitle className="mt-1 font-sans text-xl font-bold tracking-cinema text-white">
              {editing ? editing.title : "Schedule event"}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">Edit event fields and save.</DialogDescription>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="TITLE" className="sm:col-span-2">
              <Input
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-10"
                placeholder="Ramadan Strength Intensive"
              />
            </Field>

            <Field label="SUBTITLE" className="sm:col-span-2">
              <Input
                value={form.subtitle ?? ""}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="h-10"
                placeholder="8 weeks · 5 days/week"
              />
            </Field>

            <Field label="DESCRIPTION" className="sm:col-span-2">
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe the program..."
              />
            </Field>

            <Field label="LOCATION">
              <Input
                value={form.location ?? ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="h-10"
              />
            </Field>

            <Field label="CAPACITY">
              <Input
                type="number"
                value={form.capacity ?? 0}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                className="h-10 font-mono"
              />
            </Field>

            <Field label="ENROLLED">
              <Input
                type="number"
                value={form.enrolled ?? 0}
                onChange={(e) => setForm({ ...form, enrolled: Number(e.target.value) })}
                className="h-10 font-mono"
              />
            </Field>

            <Field label="DURATION (days)">
              <Input
                type="number"
                value={form.durationDays ?? 0}
                onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
                className="h-10 font-mono"
              />
            </Field>

            <Field label="START DATE">
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/40" />
                <Input
                  type="date"
                  value={dateInputValue(form.startDate ?? "")}
                  onChange={(e) =>
                    setForm({ ...form, startDate: new Date(e.target.value).toISOString() })
                  }
                  className="h-10 pl-8 font-mono"
                />
              </div>
            </Field>

            <Field label="END DATE">
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-white/40" />
                <Input
                  type="date"
                  value={dateInputValue(form.endDate ?? "")}
                  onChange={(e) =>
                    setForm({ ...form, endDate: new Date(e.target.value).toISOString() })
                  }
                  className="h-10 pl-8 font-mono"
                />
              </div>
            </Field>

            <Field label="ACCENT">
              <Select
                value={form.accent ?? "neon"}
                onValueChange={(v) => setForm({ ...form, accent: v as EventDTO["accent"] })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neon">NEON</SelectItem>
                  <SelectItem value="crimson">CRIMSON</SelectItem>
                  <SelectItem value="gold">GOLD</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <div className="flex items-end sm:col-span-2">
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={!!form.archived}
                  onCheckedChange={(v) => setForm({ ...form, archived: v })}
                />
                <span className="font-mono text-[10px] tracking-mega text-white/55">ARCHIVED</span>
              </div>
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
              disabled={saveMut.isPending || !form.title}
              className="gap-2 bg-[var(--neon)] text-[var(--obsidian)] font-mono text-[10px] tracking-mega hover:bg-[var(--neon)]/90 disabled:opacity-40"
            >
              <Save className="size-3.5" /> {saveMut.isPending ? "SAVING…" : "SAVE"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
