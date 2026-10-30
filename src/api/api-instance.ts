import { type CookieJar, readSavedSession, saveSession } from "@/lib/saved-session";

import { createClient } from "./client";
import { createServerClock } from "./clock";
import { API_CONFIG } from "./config";
import { ENDPOINTS } from "./endpoints";
import type { Session, User } from "./interface";
import { createSession } from "./session";

export type { ApiResult } from "./client";

// The password stays in memory only; after a reload an expired token sends the user to sign in.
let credentials: { username: string; password: string } | null = null;
let onSignedOut: () => void = () => undefined;

function cookieJar(): CookieJar | null {
  return typeof document === "undefined" ? null : document;
}

// The token is kept in a short-lived cookie so a reload or a new tab stays signed in.
function persist(next: Session | null) {
  const jar = cookieJar();
  if (jar) saveSession(jar, next, clock.now());
}

export const session = createSession(async () => {
  if (!credentials) {
    signOut();
    onSignedOut();
    throw new Error("Signed out");
  }
  const next = await requestSession(credentials.username, credentials.password);
  persist(next);
  return next;
});

// Server time from the Date header, so "today" follows the server, not the laptop clock.
export const clock = createServerClock();

const apiInstance = createClient({
  baseUrl: API_CONFIG.BASE_URL,
  candidateId: API_CONFIG.CANDIDATE_ID,
  session,
  clock,
});

async function requestSession(username: string, password: string): Promise<Session> {
  const { data } = await apiInstance.request<Session>("POST", ENDPOINTS.SESSIONS, {
    body: { username, password },
    anonymous: true,
  });
  return data;
}

export function restoreUser(): User | null {
  const jar = cookieJar();
  const saved = jar ? readSavedSession(jar, clock.now()) : null;
  if (!saved) return null;
  session.set(saved);
  return saved.user;
}

export function whenSignedOut(listener: () => void) {
  onSignedOut = listener;
}

export async function signIn(username: string, password: string): Promise<User> {
  const result = await requestSession(username, password);
  credentials = { username, password };
  session.set(result);
  persist(result);
  return result.user;
}

export function signOut() {
  credentials = null;
  session.clear();
  persist(null);
}

export default apiInstance;
