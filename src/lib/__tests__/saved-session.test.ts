import { expect, test } from "vitest";

import type { Session } from "@/api/interface";

import { readSavedSession, saveSession } from "../saved-session";

// Behaves like document.cookie: a write sets or deletes one cookie, a read lists them all.
function cookieJar() {
  const cookies = new Map<string, string>();
  const writes: string[] = [];
  return {
    writes,
    get cookie() {
      return [...cookies].map(([k, v]) => `${k}=${v}`).join("; ");
    },
    set cookie(line: string) {
      writes.push(line);
      const [pair] = line.split(";");
      const [name, value] = pair!.split("=");
      if (/max-age=0(;|$)/i.test(line)) cookies.delete(name!);
      else cookies.set(name!, value ?? "");
    },
  };
}

const NOW = Date.parse("2026-10-29T12:00:00Z");
const session = (expiresAt: string) =>
  ({ accessToken: "t1", expiresAt, user: { id: "usr_finance", role: "finance" } }) as Session;

test("a saved session that has not expired is restored", () => {
  const jar = cookieJar();
  saveSession(jar, session("2026-10-29T12:05:00Z"), NOW);
  expect(readSavedSession(jar, NOW)?.accessToken).toBe("t1");
});

test("the cookie lives only as long as the token and never leaves the site", () => {
  const jar = cookieJar();
  saveSession(jar, session("2026-10-29T12:05:00Z"), NOW);
  expect(jar.writes[0]).toContain("Max-Age=300");
  expect(jar.writes[0]).toContain("SameSite=Strict");
  expect(jar.writes[0]).toContain("Path=/");
  expect(jar.writes[0]).toContain("Secure");
});

test("an expired session is dropped and its cookie removed", () => {
  const jar = cookieJar();
  saveSession(jar, session("2026-10-29T12:05:00Z"), NOW);
  expect(readSavedSession(jar, Date.parse("2026-10-29T12:06:00Z"))).toBeNull();
  expect(jar.cookie).toBe("");
});

test("clearing forgets the session", () => {
  const jar = cookieJar();
  saveSession(jar, session("2026-10-29T12:05:00Z"), NOW);
  saveSession(jar, null, NOW);
  expect(readSavedSession(jar, NOW)).toBeNull();
});

test("broken cookie content is ignored", () => {
  const jar = cookieJar();
  jar.cookie = "zahln_session=%7Bnot%20json; Path=/";
  expect(readSavedSession(jar, NOW)).toBeNull();
});

test("other cookies on the site are left alone", () => {
  const jar = cookieJar();
  jar.cookie = "theme=dark; Path=/";
  saveSession(jar, session("2026-10-29T12:05:00Z"), NOW);
  expect(readSavedSession(jar, NOW)?.accessToken).toBe("t1");
  expect(jar.cookie).toContain("theme=dark");
});
