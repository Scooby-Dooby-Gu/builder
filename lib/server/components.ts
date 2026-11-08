// Collections, component drafts and published versions, on top of lib/server/store.

import type {NextApiRequest, NextApiResponse} from "next";
import seedCollections from "../../data/collections.json";
import {deleteKey, getJSON, increment, setJSON} from "./store";
import type {ComponentVariant} from "../../models/builder";

export interface StoredComponent {
    id: string,
    name: string,
    description: string,
    published_at: string,
    modified_at: string,
    modified_by: string,
    variant_count: string,
    state: string,
    datasources: { id: string | number, name: string }[],
    collection_id?: string,
}

export interface StoredCollection {
    id: string,
    title: string,
    components: StoredComponent[],
}

export interface Draft {
    variants: ComponentVariant[],
    updatedAt: string,
}

export interface PublishedVariant {
    id: string,
    name: string,
    html: string,
}

// What the embed script renders: everything needed, with no further lookups
// except optional live data in a later version.
export interface PublishedComponent {
    id: string,
    name: string,
    version: number,
    publishedAt: string,
    themeName: string | null,
    variants: PublishedVariant[],
    css: string,
    fontUrls: string[],
    data: Record<string, unknown>,
}

const COLLECTIONS_KEY = "collections";
const draftKey = (id: string) => `component:${id}:draft`;
const publishedKey = (id: string) => `component:${id}:published`;
const versionKey = (id: string) => `component:${id}:version`;

// Dates in the format the library already sorts by: DD/MM/YYYY hh:mmAM
export function libraryDate(date = new Date()) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const hours = date.getUTCHours();
    const suffix = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad(h12)}:${pad(date.getUTCMinutes())}${suffix}`;
}

function seed(): StoredCollection[] {
    // Start everything as unpublished: publish states now come from real publishes.
    return (seedCollections as any[]).map(collection => ({
        id: String(collection.id),
        title: collection.title,
        components: collection.components.map((c: any) => ({
            ...c,
            id: String(c.id),
            state: "new",
            published_at: "",
            collection_id: String(collection.id),
        })),
    }));
}

export async function getCollections(): Promise<StoredCollection[]> {
    const stored = await getJSON<StoredCollection[]>(COLLECTIONS_KEY);
    if (stored) return stored;
    const initial = seed();
    await setJSON(COLLECTIONS_KEY, initial);
    return initial;
}

export async function saveCollections(collections: StoredCollection[]) {
    await setJSON(COLLECTIONS_KEY, collections);
}

export function findComponent(collections: StoredCollection[], id: string) {
    for (const collection of collections) {
        const component = collection.components.find(c => c.id === id);
        if (component) return {collection, component};
    }
    return null;
}

export function newId() {
    return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

// Mark a component as changed after a draft save, or published after a publish.
export async function updateComponentMeta(id: string, patch: Partial<StoredComponent>) {
    const collections = await getCollections();
    const found = findComponent(collections, id);
    if (!found) return null;
    Object.assign(found.component, patch);
    await saveCollections(collections);
    return found.component;
}

export async function getDraft(id: string) {
    return getJSON<Draft>(draftKey(id));
}

export async function saveDraft(id: string, variants: ComponentVariant[]): Promise<Draft> {
    const draft: Draft = {variants, updatedAt: new Date().toISOString()};
    await setJSON(draftKey(id), draft);
    const published = await getPublished(id);
    await updateComponentMeta(id, {
        modified_at: libraryDate(),
        variant_count: String(variants.filter(v => !v.isDeleted).length),
        state: published ? "changed" : "new",
    });
    return draft;
}

export async function getPublished(id: string) {
    return getJSON<PublishedComponent>(publishedKey(id));
}

export async function publish(id: string, snapshot: Omit<PublishedComponent, "id" | "version" | "publishedAt" | "name">) {
    const version = await increment(versionKey(id));
    const collections = await getCollections();
    const name = findComponent(collections, id)?.component.name ?? `Component ${id}`;
    const published: PublishedComponent = {
        ...snapshot,
        id,
        name,
        version,
        publishedAt: new Date().toISOString(),
    };
    await setJSON(publishedKey(id), published);
    await updateComponentMeta(id, {
        state: "published",
        published_at: libraryDate(),
        variant_count: String(snapshot.variants.length),
    });
    return published;
}

export async function deleteComponentData(id: string) {
    await Promise.all([deleteKey(draftKey(id)), deleteKey(publishedKey(id)), deleteKey(versionKey(id))]);
}

// Request bodies arrive as JSON strings (the client sends no content type) or parsed objects.
export function readBody<T = any>(req: NextApiRequest): T {
    if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : ({} as T);
    return (req.body ?? {}) as T;
}

export function methodNotAllowed(res: NextApiResponse, allowed: string[]) {
    res.setHeader("Allow", allowed.join(", "));
    return res.status(405).json({error: `Method not allowed. Use ${allowed.join(" or ")}.`});
}

export async function handle(res: NextApiResponse, fn: () => Promise<unknown>) {
    try {
        await fn();
    } catch (error) {
        console.error(error);
        if (!res.headersSent) res.status(500).json({error: "Something went wrong on the server."});
    }
}
