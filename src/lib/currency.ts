export type Currency = "PKR" | "USD" | "AED";

export function detectCurrency(): Currency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Dubai") || tz.includes("Abu_Dhabi")) return "AED";
    if (
      tz.startsWith("America/") ||
      tz.startsWith("US/") ||
      tz.includes("Honolulu")
    )
      return "USD";
  } catch {
    /* ignore */
  }
  return "PKR";
}

export function convertFromPkr(
  pkr: number,
  currency: Currency,
  usdRate: number,
  aedRate: number,
): number {
  if (currency === "USD") return pkr / (usdRate || 281);
  if (currency === "AED") return pkr / (aedRate || 76.6);
  return pkr;
}

export function formatMoney(
  pkr: number,
  currency: Currency,
  usdRate: number,
  aedRate: number,
): string {
  const v = convertFromPkr(pkr, currency, usdRate, aedRate);
  if (currency === "PKR") {
    return `Rs ${Math.round(v).toLocaleString("en-PK")}`;
  }
  if (currency === "USD") {
    return `$${v.toLocaleString("en-US", { maximumFractionDigits: v < 100 ? 2 : 0 })}`;
  }
  return `AED ${v.toLocaleString("en-US", { maximumFractionDigits: v < 100 ? 2 : 0 })}`;
}
