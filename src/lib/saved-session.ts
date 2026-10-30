import type { Session } from "@/api/interface";

const NAME = "zahln_session";
// Set from JavaScript, so it cannot be HttpOnly; the attributes keep it on this site and short-lived.
const ATTRIBUTES = "Path=/; SameSite=Strict; Secure";

export type CookieJar = { cookie: string };

function write(jar: CookieJar, value: string, maxAgeSeconds: number) {
  jar.cookie = `${NAME}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; ${ATTRIBUTES}`;
}

function read(jar: CookieJar): string | null {
  for (const part of jar.cookie.split("; ")) {
    const [name, ...value] = part.split("=");
    if (name === NAME) return decodeURIComponent(value.join("="));
  }
  return null;
}

// Only the short-lived token is kept, so a reload does not ask for the password again.
// The cookie expires with the token; the password is never stored.
export function saveSession(jar: CookieJar, session: Session | null, nowMs: number) {
  if (!session) return write(jar, "", 0);
  const seconds = Math.floor((Date.parse(session.expiresAt) - nowMs) / 1000);
  write(jar, JSON.stringify(session), Math.max(seconds, 0));
}

export function readSavedSession(jar: CookieJar, nowMs: number): Session | null {
  try {
    const raw = read(jar);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (Date.parse(session.expiresAt) > nowMs) return session;
  } catch {
    // Unreadable content is treated as no session.
  }
  write(jar, "", 0);
  return null;
}
