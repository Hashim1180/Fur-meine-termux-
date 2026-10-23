import type { Currency } from "./types"

// Format a PKR-base price into the requested currency.
export function convertPrice(pricePKR: number, currency: Currency, rates: { usdRate: number; aedRate: number }): number {
  switch (currency) {
    case "USD":
      return pricePKR / rates.usdRate
    case "AED":
      return pricePKR / rates.aedRate
    default:
      return pricePKR
  }
}

export function formatPrice(pricePKR: number, currency: Currency, rates: { usdRate: number; aedRate: number }): string {
  const v = convertPrice(pricePKR, currency, rates)
  switch (currency) {
    case "PKR":
      return "Rs " + Math.round(v).toLocaleString("en-PK")
    case "USD":
      return "$" + v.toFixed(2)
    case "AED":
      return "AED " + Math.round(v).toLocaleString("en-AE")
  }
}

export function currencySymbol(currency: Currency): string {
  switch (currency) {
    case "PKR":
      return "Rs"
    case "USD":
      return "$"
    case "AED":
      return "AED"
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

export function timeRemaining(ms: number): { d: number; h: number; m: number; s: number; done: boolean } {
  if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true }
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return { d, h, m, s, done: false }
}
