import { db } from "./db"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"

const SESSION_MS = 1000 * 60 * 60 * 12 // 12h

export async function createSession(): Promise<string> {
  const token = randomBytes(32).toString("hex")
  await db.adminSession.create({
    data: {
      token,
      expiresAt: new Date(Date.now() + SESSION_MS),
    },
  })
  return token
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return
  await db.adminSession.deleteMany({ where: { token } })
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get("aw_admin")?.value
  if (!token) return false
  const s = await db.adminSession.findUnique({ where: { token } })
  if (!s) return false
  if (s.expiresAt.getTime() < Date.now()) {
    await db.adminSession.delete({ where: { token } })
    return false
  }
  return true
}

export async function verifyPassword(pw: string): Promise<boolean> {
  const row = await db.setting.findUnique({ where: { id: "adminPassword" } })
  const correct = row?.value ?? "awgyms2026"
  return pw === correct
}
