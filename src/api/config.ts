// Read from .env at build time; copy .env.example to .env before the first run.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CANDIDATE_ID = import.meta.env.VITE_CANDIDATE_ID;

if (!BASE_URL || !CANDIDATE_ID) {
  throw new Error("VITE_API_BASE_URL and VITE_CANDIDATE_ID must be set in .env");
}

export const API_CONFIG = { BASE_URL, CANDIDATE_ID };
