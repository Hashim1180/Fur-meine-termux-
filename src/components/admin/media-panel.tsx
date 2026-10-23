"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  Upload,
  Trash2,
  Play,
  ImageIcon,
  Film,
  Music,
  Package,
} from "lucide-react"
import { api } from "@/lib/api-client"
import { useAdmin } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { formatBytes } from "@/lib/format"
import type { MediaDTO, ProductDTO } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
const TAGS = ["product", "facility", "ambient", "ui"]

type Filter = "all" | "photo" | "video" | "audio"

export default function MediaPanel() {
  const qc = useQueryClient()
  const setAuthed = useAdmin((s) => s.setAuthed)
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [filter, setFilter] = useState<Filter>("all")
  const [tagFilter, setTagFilter] = useState<string>("all")
  const [uploadTag, setUploadTag] = useState("product")
  const [uploadName, setUploadName] = useState("")
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [editingName, setEditingName] = useState<{ id: string; value: string } | null>(null)

  const q = useQuery<MediaDTO[]>({
    queryKey: ["admin", "media"],
    queryFn: () => api.admin.media(),
    retry: false,
  })

  const productsQ = useQuery<ProductDTO[]>({
    queryKey: ["admin", "products"],
    queryFn: () => api.admin.products(),
    retry: false,
  })

  useEffect(() => {
    if (q.isError || productsQ.isError) setAuthed(false)
  }, [q.isError, productsQ.isError, setAuthed])

  const uploadMut = useMutation({
    mutationFn: async ({ file, tag, name }: { file: File; tag: string; name: string }) => {
      setProgress(0)
      // emulate progress since fetch doesn't give upload progress natively
      const iv = setInterval(() => setProgress((p) => (p === null ? 5 : Math.min(85, p + 8))), 120)
      try {
        return await api.admin.uploadMedia(file, tag, name)
      } finally {
        clearInterval(iv)
        setProgress(100)
        setTimeout(() => setProgress(null), 500)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] })
      toast({ title: "Upload complete" })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
      setProgress(null)
      toast({ title: "Upload failed", description: e.message, variant: "destructive" })
    },
  })

  const renameMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] })
      toast({ title: "Renamed" })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
    },
  })

  const delMut = useMutation({
    mutationFn: (id: string) => api.admin.deleteMedia(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] })
      toast({ title: "Media deleted" })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
    },
  })

  const swapMut = useMutation({
    mutationFn: ({ productId, path, kind }: { productId: string; path: string; kind: "image" | "video" }) =>
      api.admin.saveProduct({ id: productId, [kind]: path } as Partial<ProductDTO>),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] })
      toast({
        title: "Linked to product",
        description: `${vars.kind === "image" ? "Photo" : "Video"} swapped into product.`,
      })
    },
    onError: (e: Error) => {
      if (String(e).includes("401")) setAuthed(false)
    },
  })

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return
    Array.from(files).forEach((file) => {
      const name = uploadName.trim() || file.name.replace(/\.[^.]+$/, "")
      uploadMut.mutate({ file, tag: uploadTag, name })
    })
  }

  const media = useMemo(() => {
    let list = q.data ?? []
    if (filter !== "all") list = list.filter((m) => m.type === filter)
    if (tagFilter !== "all") list = list.filter((m) => m.tag === tagFilter)
    return list
  }, [q.data, filter, tagFilter])

  const products = productsQ.data ?? []

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
            MEDIA LIBRARY
          </div>
          <h1 className="mt-1 font-sans text-3xl font-black tracking-cinema text-white sm:text-4xl">
            MEDIA <span className="text-gradient-neon">/ ASSETS</span>
          </h1>
          <p className="mt-1 font-mono text-[11px] tracking-wide-2 text-white/45">
            {(q.data ?? []).length} files · upload, swap into products, delete
          </p>
        </div>
      </motion.div>

      {/* upload zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
        className="glass rounded-xl p-4 sm:p-5"
      >
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => fileRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging
              ? "border-[var(--neon)] bg-[var(--neon)]/5"
              : "border-white/15 hover:border-white/25 hover:bg-white/[0.02]"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Upload className="size-5 text-[var(--neon)]" />
          </div>
          <div className="mt-3 font-sans text-base font-bold text-white">
            Drop files or <span className="text-[var(--neon)]">browse</span>
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-wide-2 text-white/45">
            Photos · Videos · Audio — multiple files supported
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label className="mb-1.5 font-mono text-[10px] tracking-mega text-white/45">
              TAG
            </Label>
            <Select value={uploadTag} onValueChange={setUploadTag}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAGS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="mb-1.5 font-mono text-[10px] tracking-mega text-white/45">
              NAME (optional — defaults to filename)
            </Label>
            <Input
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              className="h-10"
              placeholder="whey-gold-packshot"
            />
          </div>
        </div>

        {progress !== null && (
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between font-mono text-[10px] tracking-wide-2 text-white/45">
              <span>UPLOADING…</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-white/10" />
          </div>
        )}
      </motion.div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          {(["all", "photo", "video", "audio"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 font-mono text-[10px] tracking-mega transition-colors ${
                filter === f ? "bg-[var(--neon)] text-[var(--obsidian)]" : "text-white/55 hover:text-white"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[10px] tracking-mega text-white/40">TAG:</span>
          {["all", ...TAGS].map((t) => (
            <button
              key={t}
              onClick={() => setTagFilter(t)}
              className={`rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide-2 transition-colors ${
                tagFilter === t
                  ? "border-[var(--neon)]/50 bg-[var(--neon)]/10 text-[var(--neon)]"
                  : "border-white/10 text-white/45 hover:text-white/70"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {media.map((m) => (
          <MediaTile
            key={m.id}
            media={m}
            products={products}
            editingName={editingName}
            setEditingName={setEditingName}
            onRename={(name) => renameMut.mutate({ id: m.id, name })}
            onDelete={() => delMut.mutate(m.id)}
            onSwap={(productId, kind) => swapMut.mutate({ productId, path: m.path, kind })}
            swapping={swapMut.isPending}
          />
        ))}
      </motion.div>

      {media.length === 0 && !q.isLoading && (
        <div className="glass flex flex-col items-center justify-center rounded-xl py-16 text-center">
          <ImageIcon className="size-8 text-white/25" />
          <div className="mt-3 font-sans text-base font-bold text-white/55">No media</div>
          <div className="mt-1 font-mono text-[10px] tracking-wide-2 text-white/35">
            Upload photos, videos, or audio to populate the library
          </div>
        </div>
      )}
    </div>
  )
}

function MediaTile({
  media,
  products,
  editingName,
  setEditingName,
  onRename,
  onDelete,
  onSwap,
  swapping,
}: {
  media: MediaDTO
  products: ProductDTO[]
  editingName: { id: string; value: string } | null
  setEditingName: (v: { id: string; value: string } | null) => void
  onRename: (name: string) => void
  onDelete: () => void
  onSwap: (productId: string, kind: "image" | "video") => void
  swapping: boolean
}) {
  const [swapTarget, setSwapTarget] = useState<string>("")
  const icon =
    media.type === "photo" ? ImageIcon : media.type === "video" ? Film : Music
  const Icon = icon

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="glass group relative overflow-hidden rounded-xl"
    >
      {/* preview */}
      <div className="relative aspect-square w-full overflow-hidden bg-black/40">
        {media.type === "photo" ? (
          <img src={media.path} alt={media.name} className="h-full w-full object-cover" />
        ) : media.type === "video" ? (
          <video
            src={media.path}
            className="h-full w-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <div className="flex size-12 items-center justify-center rounded-full border border-[var(--neon)]/40 bg-[var(--neon)]/10">
              <Play className="size-4 text-[var(--neon)]" fill="currentColor" />
            </div>
            <div className="flex h-6 items-end gap-0.5">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="w-0.5 rounded-full bg-[var(--neon)]/50"
                  style={{ height: `${6 + Math.abs(Math.sin(i * 0.9)) * 18}px` }}
                />
              ))}
            </div>
          </div>
        )}
        {/* overlay top */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
          <Badge className="border-white/10 bg-black/60 text-white/80 backdrop-blur">
            <Icon className="size-2.5" /> {media.type.toUpperCase()}
          </Badge>
          <Badge className="border-white/10 bg-black/60 font-mono text-[9px] text-white/70 backdrop-blur">
            {media.tag.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* body */}
      <div className="p-3">
        {editingName?.id === media.id ? (
          <Input
            autoFocus
            value={editingName.value}
            onChange={(e) => setEditingName({ ...editingName, value: e.target.value })}
            onBlur={() => {
              onRename(editingName.value)
              setEditingName(null)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onRename(editingName.value)
                setEditingName(null)
              }
              if (e.key === "Escape") setEditingName(null)
            }}
            className="h-7 text-xs"
          />
        ) : (
          <button
            onClick={() => setEditingName({ id: media.id, value: media.name })}
            className="block w-full truncate text-left text-sm font-medium text-white hover:text-[var(--neon)]"
            title="Click to rename"
          >
            {media.name}
          </button>
        )}
        <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-white/45">
          <span>{formatBytes(media.size)}</span>
          <span>{new Date(media.createdAt).toLocaleDateString("en-US", { day: "2-digit", month: "short" })}</span>
        </div>

        {/* swap into product */}
        {media.type !== "audio" && products.length > 0 && (
          <div className="mt-2">
            <Select
              value={swapTarget}
              onValueChange={(v) => {
                setSwapTarget(v)
                onSwap(v, media.type === "photo" ? "image" : "video")
              }}
              disabled={swapping}
            >
              <SelectTrigger className="h-7 w-full border-white/10 bg-white/[0.03] px-2 text-[11px]">
                <Package className="size-3 text-white/40" />
                <SelectValue placeholder="use in product…" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-9 size-7 rounded-md bg-black/60 text-white/70 opacity-0 backdrop-blur transition-opacity hover:text-[var(--crimson)] group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="glass-strong border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete media?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/55">
              Removes <span className="text-[var(--neon)]">{media.name}</span> from disk and the
              database. Products referencing it will need re-assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white/70">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson)]/90"
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
