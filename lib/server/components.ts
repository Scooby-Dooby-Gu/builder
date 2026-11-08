// Collections, component drafts and published versions, on top of lib/server/store.
//
// Everything is read and written within a namespace (see lib/server/http.ts): the
// owner's live data, or a visitor's sandbox. A sandbox starts empty and falls back
// to the live data, so visitors see the real content until they change something;
// their first write copies what they need into the sandbox.

import {LIBRARY, seedVariants} from "../../data/components";
import {deleteKey, getJSON, increment, incrementWindow, setJSON} from "./store";
import {HttpError, LIVE, Namespace} from "./http";
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

// What the embed script renders: everything needed, with no further lookups.
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

// Limits that keep storage bounded. Sandboxes get less room than the live data.
export const LIMITS = {
    collections: {owner: 30, sandbox: 10},
    components: {owner: 100, sandbox: 20},
    variantsPerComponent: 20,
    variantHtmlChars: 100_000,
    draftChars: 300_000,
    publishChars: 500_000,
    titleChars: 120,
    descriptionChars: 500,
};

const collectionsKey = (ns: Namespace) => `${ns.prefix}collections`;
const draftKey = (ns: Namespace, id: string) => `${ns.prefix}component:${id}:draft`;
const publishedKey = (ns: Namespace, id: string) => `${ns.prefix}component:${id}:published`;
const versionKey = (ns: Namespace, id: string) => `${ns.prefix}component:${id}:version`;

const isSandbox = (ns: Namespace) => ns.kind === "sandbox" && Boolean(ns.prefix);

// Dates in the format the library already sorts by: DD/MM/YYYY hh:mmAM
export function libraryDate(date = new Date()) {
    const pad = (n: number) => String(n).padStart(2, "0");
    const hours = date.getUTCHours();
    const suffix = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()} ${pad(h12)}:${pad(date.getUTCMinutes())}${suffix}`;
}

// The starter library (data/components.ts), all unpublished to begin with.
function seed(): StoredCollection[] {
    const created = libraryDate();
    return LIBRARY.map(collection => ({
        id: collection.id,
        title: collection.title,
        components: collection.components.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            published_at: "",
            modified_at: created,
            modified_by: "Acme",
            variant_count: String(c.variants.length),
            state: "new",
            datasources: c.datasources,
            collection_id: collection.id,
        })),
    }));
}

// ------------------------------------------------------------------ collections

export async function getCollections(ns: Namespace = LIVE): Promise<StoredCollection[]> {
    const stored = await getJSON<StoredCollection[]>(collectionsKey(ns));
    if (stored) return stored;
    if (ns.prefix) return getCollections(LIVE);
    const initial = seed();
    await setJSON(collectionsKey(LIVE), initial);
    return initial;
}

export async function saveCollections(ns: Namespace, collections: StoredCollection[]) {
    const limit = ns.kind === "owner" ? LIMITS.collections.owner : LIMITS.collections.sandbox;
    const componentLimit = ns.kind === "owner" ? LIMITS.components.owner : LIMITS.components.sandbox;
    if (collections.length > limit) {
        throw new HttpError(400, `You can have up to ${limit} collections${isSandbox(ns) ? " in the demo sandbox" : ""}.`);
    }
    const componentCount = collections.reduce((n, c) => n + c.components.length, 0);
    if (componentCount > componentLimit) {
        throw new HttpError(400, `You can have up to ${componentLimit} components${isSandbox(ns) ? " in the demo sandbox" : ""}.`);
    }
    await setJSON(collectionsKey(ns), collections, ns.ttl);
}

export function findComponent(collections: StoredCollection[], id: string) {
    for (const collection of collections) {
        const component = collection.components.find(c => c.id === id);
        if (component) return {collection, component};
    }
    return null;
}

export async function requireComponent(ns: Namespace, id: string) {
    const found = findComponent(await getCollections(ns), id);
    if (!found) throw new HttpError(404, "Component not found.");
    return found;
}

export function newId() {
    return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

async function updateComponentMeta(ns: Namespace, id: string, patch: Partial<StoredComponent>) {
    const collections = await getCollections(ns);
    const found = findComponent(collections, id);
    if (!found) return null;
    Object.assign(found.component, patch);
    await saveCollections(ns, collections);
    return found.component;
}

// ------------------------------------------------------------------ drafts

export async function getDraft(ns: Namespace, id: string): Promise<Draft | null> {
    const own = await getJSON<Draft>(draftKey(ns, id));
    if (own) return own;
    if (ns.prefix) {
        const live = await getJSON<Draft>(draftKey(LIVE, id));
        if (live) return live;
    }
    // Starter components begin with their built-in variants.
    const starter = seedVariants(id);
    return starter ? {variants: starter, updatedAt: ""} : null;
}

function validateVariants(variants: unknown): ComponentVariant[] {
    if (!Array.isArray(variants)) throw new HttpError(400, "Send the component's variants.");
    if (variants.length > LIMITS.variantsPerComponent) {
        throw new HttpError(400, `A component can have up to ${LIMITS.variantsPerComponent} variants.`);
    }
    let total = 0;
    const clean = variants.map((v: any) => {
        const content = typeof v?.content === "string" ? v.content : "";
        if (content.length > LIMITS.variantHtmlChars) {
            throw new HttpError(413, `A variant can be up to ${LIMITS.variantHtmlChars.toLocaleString()} characters.`);
        }
        total += content.length;
        return {
            id: String(v?.id ?? "").slice(0, 64),
            name: String(v?.name ?? "").slice(0, LIMITS.titleChars),
            state: ["published", "draft", "new"].includes(v?.state) ? v.state : "new",
            isDeleted: Boolean(v?.isDeleted),
            isValid: v?.isValid !== false,
            content,
        } as ComponentVariant;
    });
    if (total > LIMITS.draftChars) throw new HttpError(413, "This component is too large to save.");
    return clean;
}

export async function saveDraft(ns: Namespace, id: string, rawVariants: unknown): Promise<Draft> {
    await requireComponent(ns, id);
    const variants = validateVariants(rawVariants);
    const draft: Draft = {variants, updatedAt: new Date().toISOString()};
    await setJSON(draftKey(ns, id), draft, ns.ttl);
    const published = await getPublished(ns, id);
    await updateComponentMeta(ns, id, {
        modified_at: libraryDate(),
        variant_count: String(variants.filter(v => !v.isDeleted).length),
        state: published ? "changed" : "new",
    });
    return draft;
}

// ------------------------------------------------------------------ publishing

// For a sandbox: its own preview publish, else the live version.
export async function getPublished(ns: Namespace, id: string) {
    const own = await getJSON<PublishedComponent>(publishedKey(ns, id));
    if (own || !ns.prefix) return own;
    return getJSON<PublishedComponent>(publishedKey(LIVE, id));
}

export function validateSnapshot(body: any): Omit<PublishedComponent, "id" | "version" | "publishedAt" | "name"> {
    const variants: PublishedVariant[] = (Array.isArray(body?.variants) ? body.variants : [])
        .slice(0, LIMITS.variantsPerComponent)
        .map((v: any) => ({id: String(v?.id ?? "").slice(0, 64), name: String(v?.name ?? "").slice(0, LIMITS.titleChars), html: String(v?.html ?? "")}))
        .filter((v: PublishedVariant) => v.html.trim());
    if (!variants.length) throw new HttpError(400, "There's nothing to publish yet. Add content to a variant first.");
    const snapshot = {
        themeName: typeof body?.themeName === "string" ? body.themeName.slice(0, LIMITS.titleChars) : null,
        variants,
        css: String(body?.css ?? ""),
        fontUrls: (Array.isArray(body?.fontUrls) ? body.fontUrls : []).map(String)
            .filter((u: string) => /^https:\/\/fonts\.googleapis\.com\//.test(u)).slice(0, 10),
        data: body?.data && typeof body.data === "object" && !Array.isArray(body.data) ? body.data : {},
    };
    if (JSON.stringify(snapshot).length > LIMITS.publishChars) {
        throw new HttpError(413, "This component is too large to publish.");
    }
    return snapshot;
}

export async function publish(ns: Namespace, id: string, snapshot: ReturnType<typeof validateSnapshot>) {
    const {component} = await requireComponent(ns, id);
    const version = ns.ttl
        ? await incrementWindow(versionKey(ns, id), ns.ttl)
        : await increment(versionKey(ns, id));
    const published: PublishedComponent = {
        ...snapshot,
        id,
        name: component.name,
        version,
        publishedAt: new Date().toISOString(),
    };
    await setJSON(publishedKey(ns, id), published, ns.ttl);
    await updateComponentMeta(ns, id, {
        state: "published",
        published_at: libraryDate(),
        variant_count: String(snapshot.variants.length),
    });
    return published;
}

// Removes a component's draft and versions in this namespace only; a sandbox never
// touches live data.
export async function deleteComponentData(ns: Namespace, id: string) {
    await Promise.all([deleteKey(draftKey(ns, id)), deleteKey(publishedKey(ns, id)), deleteKey(versionKey(ns, id))]);
}
