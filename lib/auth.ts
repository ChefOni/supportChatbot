import "dotenv/config";
import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
const COOKIE_NAME = "baki_session";
const SESSION_DURATION = 86400000; // 24h

export function signSession(email: string): string {
  const expires = Date.now() + SESSION_DURATION;
  const payload = `${email}|${expires}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

export function verifySession(token: string): string | null {
  try {
    const parts = token.split("|");
    if (parts.length !== 3) return null;

    const [email, expires, sig] = parts;
    const expected = createHmac("sha256", SECRET)
      .update(`${email}|${expires}`)
      .digest("hex");

    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);

    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    if (Number(expires) < Date.now()) return null;

    return email;
  } catch {
    return null;
  }
}

export function validateCredentials(
  email: string,
  password: string
): boolean {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}

export { COOKIE_NAME };
