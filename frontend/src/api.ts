// src/api.ts
const API_PREFIX = "/api";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_PREFIX}${path}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} -> ${res.status} ${text}`);
  }
  return res.json() as Promise<T>;
}
