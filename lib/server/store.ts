// Key-value storage for the API routes.
//
// Uses Upstash Redis (over its REST API) when credentials are present (Vercel's Upstash integration
// sets KV_REST_API_URL / KV_REST_API_TOKEN; Upstash's own names also work).
// Without them it falls back to process memory, which is fine for local
// development but does not persist across restarts or serverless instances.

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

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

const redis = url && token ? {
    get: async <T>(key: string): Promise<T | null> => {
        const raw = await command<string | null>("GET", key);
        return raw == null ? null : JSON.parse(raw) as T;
    },
    set: (key: string, value: unknown) => command("SET", key, JSON.stringify(value)),
    del: (key: string) => command("DEL", key),
    incr: (key: string) => command<number>("INCR", key),
} : null;

const PREFIX = "builder:";

type MemoryStore = Map<string, unknown>;
const globalForMemory = globalThis as unknown as { __builderMemoryStore?: MemoryStore };
const memory: MemoryStore = globalForMemory.__builderMemoryStore ?? new Map();
globalForMemory.__builderMemoryStore = memory;

if (!redis && process.env.NODE_ENV === "production") {
    console.warn("[store] No Redis credentials found; using in-memory storage. Data will not persist.");
}

export const storageKind = redis ? "redis" : "memory";

export async function getJSON<T>(key: string): Promise<T | null> {
    if (redis) return (await redis.get<T>(PREFIX + key)) ?? null;
    const value = memory.get(PREFIX + key);
    return value === undefined ? null : JSON.parse(JSON.stringify(value)) as T;
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
    if (redis) {
        await redis.set(PREFIX + key, value);
        return;
    }
    memory.set(PREFIX + key, JSON.parse(JSON.stringify(value)));
}

export async function deleteKey(key: string): Promise<void> {
    if (redis) {
        await redis.del(PREFIX + key);
        return;
    }
    memory.delete(PREFIX + key);
}

export async function increment(key: string): Promise<number> {
    if (redis) return redis.incr(PREFIX + key);
    const next = (Number(memory.get(PREFIX + key)) || 0) + 1;
    memory.set(PREFIX + key, next);
    return next;
}
