// Shared types for AW GYMS 2.0
export type Currency = "PKR" | "USD" | "AED"

export interface ProductDTO {
  id: string
  name: string
  category: string
  tagline: string
  description: string
  pricePKR: number
  badges: string[]
  image: string
  video: string
  model3d: string
  featured: boolean
  inStock: boolean
  rating: number
  order: number
}

export interface EventDTO {
  id: string
  title: string
  subtitle: string
  description: string
  location: string
  capacity: number
  enrolled: number
  durationDays: number
  startDate: string
  endDate: string
  accent: "neon" | "crimson" | "gold"
  archived: boolean
  order: number
  // computed client-side
  msRemaining?: number
  totalMs?: number
}

export interface MediaDTO {
  id: string
  type: "photo" | "video" | "audio"
  name: string
  path: string
  mime: string
  size: number
  tag: string
  createdAt: string
}

export interface SettingsDTO {
  whatsappNumber: string
  usdRate: number
  aedRate: number
  announcement: string
  sketchfabUrl: string
  brandName: string
  brandTagline: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export interface ChatRequest {
  sessionId: string
  messages: ChatMessage[]
  currency?: Currency
}

export interface InvoiceItem {
  name: string
  qty: number
  unitPKR: number
  totalPKR: number
}

export interface Invoice {
  id: string
  items: InvoiceItem[]
  subtotalPKR: number
  discountPct: number
  discountPKR: number
  totalPKR: number
  totalUSD: number
  totalAED: number
  currency: Currency
  createdAt: string
  customerNote: string
}
