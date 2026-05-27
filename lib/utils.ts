import { randomBytes } from "node:crypto";

export function generateId(length = 24): string {
  return randomBytes(length)
    .toString("base64url")
    .slice(0, length);
}
