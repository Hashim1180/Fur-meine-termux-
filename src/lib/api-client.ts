"use client"
import type { ProductDTO, EventDTO, MediaDTO, SettingsDTO, ChatRequest, Invoice } from "./types"

async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`${res.status} ${t}`)
  }
  return res.json()
}

export const api = {
  products: () => jfetch<{ products: ProductDTO[] }>("/api/products").then((r) => r.products),
  events: () => jfetch<{ events: EventDTO[] }>("/api/events").then((r) => r.events),
  media: () => jfetch<{ media: MediaDTO[] }>("/api/media").then((r) => r.media),
  settings: () => jfetch<{ settings: SettingsDTO }>("/api/settings").then((r) => r.settings),
  chat: (body: ChatRequest) => jfetch<{ reply: string; invoice: Invoice | null }>("/api/chat", { method: "POST", body: JSON.stringify(body) }),
  admin: {
    login: (password: string) => jfetch<{ ok: boolean }>("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) }),
    logout: () => jfetch("/api/admin/logout", { method: "POST" }),
    telemetry: () => jfetch("/api/admin/telemetry"),
    products: () => jfetch<{ products: ProductDTO[] }>("/api/admin/products").then((r) => r.products),
    events: () => jfetch<{ events: EventDTO[] }>("/api/admin/events").then((r) => r.events),
    media: () => jfetch<{ media: MediaDTO[] }>("/api/admin/media").then((r) => r.media),
    settings: () => jfetch("/api/admin/settings"),
    saveProduct: (p: Partial<ProductDTO> & { id?: string }) =>
      p.id
        ? jfetch(`/api/admin/products/${p.id}`, { method: "PATCH", body: JSON.stringify(p) })
        : jfetch("/api/admin/products", { method: "POST", body: JSON.stringify(p) }),
    deleteProduct: (id: string) => jfetch(`/api/admin/products/${id}`, { method: "DELETE" }),
    saveEvent: (e: Partial<EventDTO> & { id?: string }) =>
      e.id
        ? jfetch(`/api/admin/events/${e.id}`, { method: "PATCH", body: JSON.stringify(e) })
        : jfetch("/api/admin/events", { method: "POST", body: JSON.stringify(e) }),
    deleteEvent: (id: string) => jfetch(`/api/admin/events/${id}`, { method: "DELETE" }),
    uploadMedia: (file: File, tag: string, name: string) => {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("tag", tag)
      fd.append("name", name)
      return fetch("/api/admin/media", { method: "POST", body: fd }).then((r) => r.json())
    },
    deleteMedia: (id: string) => jfetch(`/api/admin/media/${id}`, { method: "DELETE" }),
    saveSettings: (s: Record<string, string>) => jfetch("/api/admin/settings", { method: "PATCH", body: JSON.stringify(s) }),
    bulkSync: (text: string) =>
      jfetch("/api/admin/bulk-sync", { method: "POST", headers: { "Content-Type": "text/plain" }, body: text }),
  },
}
