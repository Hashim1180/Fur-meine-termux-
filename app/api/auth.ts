import { createHash, createHmac, timingSafeEqual } from "crypto";
import { env } from "./lib/env";

const SECRET = () => env.appSecret || "aw-gyms-local-secret";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function signAdminToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ u: username, exp: Date.now() + 1000 * 60 * 60 * 12 }),
  ).toString("base64url");
  const sig = createHmac("sha256", SECRET()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string): boolean {
  const [payload, sig] = (token || "").split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", SECRET())
    .update(payload)
    .digest("base64url");
  try {
    if (
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return false;
    }
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { exp?: number };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}
