// Component publication status: the lifecycle shared by the server (which stores
// it), the component library (badges, "Publish changes") and the builder (toolbar,
// variant badges). One vocabulary everywhere.
//
//   unpublished ──publish──▶ published ──save draft──▶ changed ──publish──▶ published
//        └─save draft─┘                                  └─save draft─┘
//
// Stored values keep their original names ("new", "changed", "published") so data
// already in Redis stays valid. This file has no imports so it runs in the browser,
// on the server and under `node --test`.

export type StoredComponentState = "new" | "changed" | "published";
export type PublicationStatus = "unpublished" | "changed" | "published";

export type ComponentEvent = { type: "DRAFT_SAVED" } | { type: "PUBLISHED" };

// The stored state after an event. Unknown or legacy values (e.g. "staged") are
// treated as never published.
export function nextComponentState(current: string | undefined, event: ComponentEvent): StoredComponentState {
    switch (event.type) {
        case "PUBLISHED":
            return "published";
        case "DRAFT_SAVED":
            return current === "published" || current === "changed" ? "changed" : "new";
    }
}

export function toPublicationStatus(stored: string | undefined): PublicationStatus {
    if (stored === "published") return "published";
    if (stored === "changed") return "changed";
    return "unpublished";
}

export const PUBLICATION_LABEL: Record<PublicationStatus, string> = {
    unpublished: "Not published",
    changed: "Unpublished changes",
    published: "Published",
};

// Chakra color schemes, so badges and status text agree.
export const PUBLICATION_TONE: Record<PublicationStatus, string> = {
    unpublished: "gray",
    changed: "orange",
    published: "green",
};

// Per-variant status: compares a variant's current content with what was last published.
export type VariantStatus = "unpublished" | "changed" | "published" | "removed";

export const VARIANT_LABEL: Record<VariantStatus, string> = {
    unpublished: "Not published",
    changed: "Changed",
    published: "Published",
    removed: "Marked for deletion",
};

export const VARIANT_TONE: Record<VariantStatus, string> = {
    unpublished: "gray",
    changed: "orange",
    published: "green",
    removed: "red",
};

export function variantStatus(args: {
    isDeleted: boolean,
    currentDigest: string | undefined,
    publishedDigest: string | undefined,
}): VariantStatus {
    if (args.isDeleted) return "removed";
    if (!args.publishedDigest) return "unpublished";
    return args.currentDigest === args.publishedDigest ? "published" : "changed";
}

// A short, stable fingerprint of variant HTML (FNV-1a, 32-bit). Used to tell
// whether a variant changed since it was published, without sending the HTML.
export function digest(text: string): string {
    let hash = 0x811c9dc5;
    const input = text.trim();
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
}

export type VariantFingerprint = { id: string, digest: string };

// Fingerprints of the variants that get published: not deleted and not empty, in
// order (the first one is the embed's default). Matches buildSnapshot's filter,
// and the server computes the same from a published snapshot.
export function variantFingerprints(variants: { id: string, name?: string, content?: string, html?: string, isDeleted?: boolean }[]): VariantFingerprint[] {
    return variants
        .filter(v => !v.isDeleted)
        .map(v => ({id: String(v.id), name: String(v.name ?? ""), html: String(v.html ?? v.content ?? "").trim()}))
        .filter(v => v.html)
        .map(v => ({id: v.id, digest: digest(`${v.name}\u0000${v.html}`)}));
}

export function sameFingerprints(a: VariantFingerprint[], b: VariantFingerprint[]) {
    return a.length === b.length && a.every((v, i) => v.id === b[i].id && v.digest === b[i].digest);
}

// The stored state after saving a draft, judged by content: identical to what's
// live means still "published", so undoing an edit doesn't leave a false
// "changed". Used by the server, which has both the draft and the live version.
export function stateAfterDraftSave(draft: VariantFingerprint[], published: VariantFingerprint[] | null): StoredComponentState {
    if (!published) return "new";
    return sameFingerprints(draft, published) ? "published" : "changed";
}
