// Request helpers for the API: who is asking (owner or visitor sandbox), cookies,
// rate limits and basic request checks.

import crypto from "crypto";
import type {NextApiRequest, NextApiResponse} from "next";
import {getJSON, incrementWindow, setJSON} from "./store";

export const SANDBOX_TTL_SECONDS = 24 * 60 * 60;
export const VISITOR_PUBLISHES_PER_DAY = 5;
const MAX_NEW_SANDBOXES_PER_DAY = 200;
const OWNER_SESSION_DAYS = 30;

const OWNER_COOKIE = "builder_owner";
const SANDBOX_COOKIE = "builder_sandbox";

// ------------------------------------------------------------------ errors

export class HttpError extends Error {
    constructor(public status: number, message: string, public headers: Record<string, string> = {}) {
        super(message);
    }
}

export async function handle(res: NextApiResponse, fn: () => Promise<unknown>) {
    try {
        await fn();
    } catch (error) {
        if (error instanceof HttpError) {
            Object.entries(error.headers).forEach(([k, v]) => res.setHeader(k, v));
            if (!res.headersSent) res.status(error.status).json({error: error.message});
            return;
        }
        console.error(error);
        if (!res.headersSent) res.status(500).json({error: "Something went wrong on the server."});
    }
}

export function methodNotAllowed(res: NextApiResponse, allowed: string[]) {
    res.setHeader("Allow", allowed.join(", "));
    return res.status(405).json({error: `Method not allowed. Use ${allowed.join(" or ")}.`});
}

// Request bodies arrive as JSON strings (the client sends no content type) or parsed objects.
export function readBody<T = any>(req: NextApiRequest): T {
    if (typeof req.body === "string") {
        try {
            return (req.body ? JSON.parse(req.body) : {}) as T;
        } catch {
            throw new HttpError(400, "The request body isn't valid JSON.");
        }
    }
    return (req.body ?? {}) as T;
}

// ------------------------------------------------------------------ cookies

function parseCookies(req: NextApiRequest): Record<string, string> {
    return Object.fromEntries((req.headers.cookie || "").split(";").map(part => {
        const i = part.indexOf("=");
        return i === -1 ? [part.trim(), ""] : [part.slice(0, i).trim(), decodeURIComponent(part.slice(i + 1).trim())];
    }).filter(([k]) => k));
}

function appendCookie(res: NextApiResponse, cookie: string) {
    const existing = res.getHeader("Set-Cookie");
    const list = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
    res.setHeader("Set-Cookie", [...list, cookie]);
}

function cookie(name: string, value: string, maxAgeSeconds: number) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

// ------------------------------------------------------------------ owner session

function sessionSecret() {
    const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
    return secret ? String(secret) : null;
}

function sign(value: string) {
    const secret = sessionSecret();
    if (!secret) return null;
    return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
    const ab = Buffer.from(a), bb = Buffer.from(b);
    return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

export function isOwner(req: NextApiRequest) {
    const token = parseCookies(req)[OWNER_COOKIE];
    if (!token) return false;
    const [expires, signature] = token.split(".");
    const expected = sign(`owner:${expires}`);
    return Boolean(expected && signature && safeEqual(signature, expected) && Number(expires) > Date.now());
}

export function ownerLoginConfigured() {
    return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(password: string) {
    const actual = process.env.ADMIN_PASSWORD;
    if (!actual || !password) return false;
    // Compare digests so the comparison takes the same time whatever the input length.
    const digest = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
    return safeEqual(digest(password), digest(actual));
}

export function setOwnerSession(res: NextApiResponse) {
    const expires = String(Date.now() + OWNER_SESSION_DAYS * 86400 * 1000);
    appendCookie(res, cookie(OWNER_COOKIE, `${expires}.${sign(`owner:${expires}`)}`, OWNER_SESSION_DAYS * 86400));
}

export function clearOwnerSession(res: NextApiResponse) {
    appendCookie(res, cookie(OWNER_COOKIE, "", 0));
}

// ------------------------------------------------------------------ namespaces

// Where a request reads and writes. The owner works on the real data; each visitor
// gets a sandbox that starts as a copy of it on first write and expires a day
// after its last change.
export interface Namespace {
    kind: "owner" | "sandbox",
    prefix: string,
    ttl?: number,
    sandboxId?: string,
}

export const LIVE: Namespace = {kind: "owner", prefix: ""};

function sandboxNamespace(id: string): Namespace {
    return {kind: "sandbox", prefix: `sandbox:${id}:`, ttl: SANDBOX_TTL_SECONDS, sandboxId: id};
}

function readSandboxId(req: NextApiRequest) {
    const id = parseCookies(req)[SANDBOX_COOKIE];
    return id && /^[A-Za-z0-9_-]{22,64}$/.test(id) ? id : null;
}

export function newSandboxId() {
    return crypto.randomBytes(18).toString("base64url");
}

// Namespace for reading. Visitors without a sandbox simply read the live data.
export function readNamespace(req: NextApiRequest): Namespace {
    if (isOwner(req)) return LIVE;
    const id = readSandboxId(req);
    return id ? sandboxNamespace(id) : {kind: "sandbox", prefix: "", ttl: SANDBOX_TTL_SECONDS};
}

// Namespace for writing. Creates a visitor's sandbox (and its cookie) on first
// write, within a daily cap on new sandboxes.
export async function writeNamespace(req: NextApiRequest, res: NextApiResponse): Promise<Namespace> {
    if (isOwner(req)) return LIVE;
    const existing = readSandboxId(req);
    if (existing && await getJSON<boolean>(`sandbox:${existing}:active`)) {
        await setJSON(`sandbox:${existing}:active`, true, SANDBOX_TTL_SECONDS);
        return sandboxNamespace(existing);
    }
    const created = await incrementWindow(`limits:new-sandboxes:${utcDay()}`, 86400);
    if (created > MAX_NEW_SANDBOXES_PER_DAY) {
        throw new HttpError(503, "The demo sandbox is full for today. Please try again tomorrow.");
    }
    const id = newSandboxId();
    await setJSON(`sandbox:${id}:active`, true, SANDBOX_TTL_SECONDS);
    appendCookie(res, cookie(SANDBOX_COOKIE, id, SANDBOX_TTL_SECONDS));
    return sandboxNamespace(id);
}

export function resetSandbox(res: NextApiResponse) {
    // A new, empty sandbox on the next write; the old one expires on its own.
    appendCookie(res, cookie(SANDBOX_COOKIE, "", 0));
}

// ------------------------------------------------------------------ limits

// On Vercel, x-vercel-forwarded-for and x-real-ip are set by the platform and can't
// be supplied by the client; x-forwarded-for is only a fallback for local development.
export function clientIp(req: NextApiRequest) {
    const first = (value: unknown) => String(value || "").split(",")[0].trim();
    return first(req.headers["x-vercel-forwarded-for"])
        || first(req.headers["x-real-ip"])
        || first(req.headers["x-forwarded-for"])
        || req.socket.remoteAddress
        || "unknown";
}

function utcDay() {
    return new Date().toISOString().slice(0, 10);
}

// Fixed-window rate limit per client IP. Throws 429 with Retry-After when exceeded.
export async function rateLimit(req: NextApiRequest, bucket: string, limit: number, windowSeconds: number) {
    const window = Math.floor(Date.now() / 1000 / windowSeconds);
    const count = await incrementWindow(`ratelimit:${bucket}:${clientIp(req)}:${window}`, windowSeconds);
    if (count > limit) {
        const retryAfter = windowSeconds - Math.floor(Date.now() / 1000) % windowSeconds;
        throw new HttpError(429, "Too many requests. Please slow down and try again shortly.", {"Retry-After": String(retryAfter)});
    }
}

// Visitors can publish to their sandbox a few times a day, counted per IP so
// clearing cookies doesn't reset it.
function visitorPublishKey(req: NextApiRequest) {
    return `limits:visitor-publishes:${utcDay()}:${clientIp(req)}`;
}

export async function visitorPublishesUsed(req: NextApiRequest) {
    return Number(await getJSON<number>(visitorPublishKey(req))) || 0;
}

export async function takeVisitorPublish(req: NextApiRequest) {
    const used = await incrementWindow(visitorPublishKey(req), 86400);
    if (used > VISITOR_PUBLISHES_PER_DAY) {
        throw new HttpError(429, `Visitors can publish ${VISITOR_PUBLISHES_PER_DAY} times a day. You've used them all; try again tomorrow.`);
    }
    return VISITOR_PUBLISHES_PER_DAY - used;
}

// Writes must come from this site. SameSite cookies already block most cross-site
// requests; this also rejects scripted requests from other origins.
export function checkOrigin(req: NextApiRequest) {
    const origin = req.headers.origin;
    if (!origin) return;
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    try {
        if (new URL(String(origin)).host !== host) throw new Error();
    } catch {
        throw new HttpError(403, "Requests must come from the Builder site.");
    }
}

// Common guard for every write: origin, method-agnostic write rate limit.
export async function guardWrite(req: NextApiRequest) {
    checkOrigin(req);
    await rateLimit(req, "write-minute", 60, 60);
    await rateLimit(req, "write-hour", 600, 3600);
}

export function requireText(value: unknown, label: string, max: number, required = true) {
    const text = typeof value === "string" ? value.trim() : "";
    if (required && !text) throw new HttpError(400, `${label} is required.`);
    if (text.length > max) throw new HttpError(400, `${label} must be ${max} characters or fewer.`);
    return text;
}
