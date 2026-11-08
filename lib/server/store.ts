// Key-value storage for the API routes.
//
// Uses Upstash Redis (over its REST API) when credentials are present (Vercel's
// Upstash integration sets KV_REST_API_URL / KV_REST_API_TOKEN; Upstash's own
// names also work). Without them it falls back to process memory, which is fine
// for local development but does not persist across restarts or instances.

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const PREFIX = "builder:";

// Upstash's REST API takes a Redis command as a JSON array, so no client library is needed.
async function command<T>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(url as string, {
        method: "POST",
        headers: {Authorization: `Bearer ${token}`, "Content-Type": "application/json"},
        body: JSON.stringify(args),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.error) throw new Error(`Redis ${args[0]} failed: ${body.error ?? res.status}`);
    return body.result as T;
}

// --------------------------------------------------------------------- memory

type Entry = { value: unknown, expiresAt: number | null };
const globalForMemory = globalThis as unknown as { __builderMemoryStore?: Map<string, Entry> };
const memory = globalForMemory.__builderMemoryStore ?? new Map<string, Entry>();
globalForMemory.__builderMemoryStore = memory;

function memoryGet(key: string) {
    const entry = memory.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
        memory.delete(key);
        return undefined;
    }
    return entry;
}

// --------------------------------------------------------------------- api

const hasRedis = Boolean(url && token);
export const storageKind = hasRedis ? "redis" : "memory";

if (!hasRedis && process.env.NODE_ENV === "production") {
    console.warn("[store] No Redis credentials found; using in-memory storage. Data will not persist.");
}

export async function getJSON<T>(key: string): Promise<T | null> {
    if (hasRedis) {
        const raw = await command<string | null>("GET", PREFIX + key);
        return raw == null ? null : JSON.parse(raw) as T;
    }
    const entry = memoryGet(PREFIX + key);
    return entry ? JSON.parse(JSON.stringify(entry.value)) as T : null;
}

// ttlSeconds: expire the key after this long (sandbox data); omit to keep it.
export async function setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (hasRedis) {
        if (ttlSeconds) await command("SET", PREFIX + key, serialized, "EX", ttlSeconds);
        else await command("SET", PREFIX + key, serialized);
        return;
    }
    memory.set(PREFIX + key, {value: JSON.parse(serialized), expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null});
}

export async function deleteKey(key: string): Promise<void> {
    if (hasRedis) {
        await command("DEL", PREFIX + key);
        return;
    }
    memory.delete(PREFIX + key);
}

export async function increment(key: string): Promise<number> {
    if (hasRedis) return command<number>("INCR", PREFIX + key);
    const entry = memoryGet(PREFIX + key);
    const next = (Number(entry?.value) || 0) + 1;
    memory.set(PREFIX + key, {value: next, expiresAt: entry?.expiresAt ?? null});
    return next;
}

// Counter that starts a fresh window when it expires (rate limits, daily caps).
export async function incrementWindow(key: string, windowSeconds: number): Promise<number> {
    if (hasRedis) {
        const count = await command<number>("INCR", PREFIX + key);
        if (count === 1) await command("EXPIRE", PREFIX + key, windowSeconds);
        return count;
    }
    const entry = memoryGet(PREFIX + key);
    const next = (Number(entry?.value) || 0) + 1;
    memory.set(PREFIX + key, {value: next, expiresAt: entry?.expiresAt ?? Date.now() + windowSeconds * 1000});
    return next;
}
