// The builder's document: saving the draft and publishing it, as one explicit
// state machine. Replaces loose flags (saveStatus, savedAt, hasUnpublishedChanges,
// a local isPublishing) that could disagree with each other.
//
// Saving
//   clean ──EDITED──▶ dirty ──SAVE_STARTED──▶ saving ──SAVE_SUCCEEDED──▶ clean
//                                              │  └─EDITED─▶ saving (edited since) ──SAVE_SUCCEEDED──▶ dirty
//                                              └─SAVE_FAILED──▶ error ──SAVE_STARTED──▶ saving
// Publishing (independent of saving)
//   idle ──PUBLISH_STARTED──▶ publishing ──PUBLISH_SUCCEEDED / PUBLISH_FAILED──▶ idle
//
// Whether there's anything new to publish is derived, not stored: the saved
// variants are compared with the published ones by fingerprint, and a theme
// change since the last publish also counts.
//
// No imports beyond types and componentStatus, so it runs under `node --test`.

import {PUBLICATION_LABEL, PUBLICATION_TONE, sameFingerprints, variantStatus} from "./componentStatus";
import type {PublicationStatus, VariantFingerprint, VariantStatus} from "./componentStatus";

export type SyncState =
    | { status: "clean" }
    | { status: "dirty" }
    | { status: "saving", editedSince: boolean }
    | { status: "error", message: string };

export type PublishPhase = { status: "idle" } | { status: "publishing" };

export interface PublishedInfo {
    version: number,
    publishedAt: string,
    variants: VariantFingerprint[],
}

export interface DocumentState {
    sync: SyncState,
    publish: PublishPhase,
    savedAt: string | null,
    // What's saved now, and what's live, as ordered variant fingerprints.
    saved: VariantFingerprint[],
    published: PublishedInfo | null,
    // The theme is applied at publish time, so changing it is an unpublished change.
    themeChangedSincePublish: boolean,
}

export type DocumentEvent =
    | { type: "LOADED", savedAt: string | null, saved: VariantFingerprint[], published: PublishedInfo | null }
    | { type: "EDITED" }
    | { type: "THEME_CHANGED" }
    | { type: "SAVE_STARTED" }
    | { type: "SAVE_SUCCEEDED", savedAt: string, saved: VariantFingerprint[] }
    | { type: "SAVE_FAILED", message: string }
    | { type: "PUBLISH_STARTED" }
    | { type: "PUBLISH_SUCCEEDED", version: number, publishedAt: string }
    | { type: "PUBLISH_FAILED" };

export const initialDocument: DocumentState = {
    sync: {status: "clean"},
    publish: {status: "idle"},
    savedAt: null,
    saved: [],
    published: null,
    themeChangedSincePublish: false,
};

export function documentReducer(state: DocumentState, event: DocumentEvent): DocumentState {
    switch (event.type) {
        case "LOADED":
            return {
                ...initialDocument,
                savedAt: event.savedAt,
                saved: event.saved,
                published: event.published,
            };

        case "EDITED":
            switch (state.sync.status) {
                case "clean": return {...state, sync: {status: "dirty"}};
                case "saving": return {...state, sync: {status: "saving", editedSince: true}};
                default: return state; // dirty stays dirty; error waits for the next save attempt
            }

        case "THEME_CHANGED":
            return state.themeChangedSincePublish ? state : {...state, themeChangedSincePublish: true};

        case "SAVE_STARTED":
            return {...state, sync: {status: "saving", editedSince: false}};

        case "SAVE_SUCCEEDED": {
            const editedSince = state.sync.status === "saving" && state.sync.editedSince;
            return {
                ...state,
                sync: editedSince ? {status: "dirty"} : {status: "clean"},
                savedAt: event.savedAt,
                saved: event.saved,
            };
        }

        case "SAVE_FAILED":
            return {...state, sync: {status: "error", message: event.message}};

        case "PUBLISH_STARTED":
            return state.publish.status === "publishing" ? state : {...state, publish: {status: "publishing"}};

        case "PUBLISH_SUCCEEDED":
            return {
                ...state,
                publish: {status: "idle"},
                // Publishing always saves first, so what's saved is what went live.
                published: {version: event.version, publishedAt: event.publishedAt, variants: state.saved},
                themeChangedSincePublish: false,
            };

        case "PUBLISH_FAILED":
            return {...state, publish: {status: "idle"}};
    }
}

// ------------------------------------------------------------------ derived

export function publicationStatus(state: DocumentState): PublicationStatus {
    if (!state.published) return "unpublished";
    if (state.themeChangedSincePublish) return "changed";
    return sameFingerprints(state.saved, state.published.variants) ? "published" : "changed";
}

export function hasUnsavedWork(state: DocumentState) {
    return state.sync.status !== "clean";
}

export function variantStatuses(state: DocumentState, variants: { id: string, isDeleted?: boolean }[]): Record<string, VariantStatus> {
    const saved = new Map(state.saved.map(v => [v.id, v.digest]));
    const live = new Map((state.published?.variants ?? []).map(v => [v.id, v.digest]));
    return Object.fromEntries(variants.map(v => [v.id, variantStatus({
        isDeleted: Boolean(v.isDeleted),
        currentDigest: saved.get(v.id),
        publishedDigest: live.get(v.id),
    })]));
}

export interface StatusLine {
    text: string,
    tone: string,
}

// The toolbar's status line. Saving states take priority over publication.
export function statusLine(state: DocumentState, timeAgo: (iso: string) => string = (iso) => iso): StatusLine {
    switch (state.sync.status) {
        case "saving": return {text: "Saving…", tone: "gray"};
        case "dirty": return {text: "Unsaved changes", tone: "gray"};
        case "error": return {text: "Couldn’t save", tone: "red"};
    }
    const status = publicationStatus(state);
    if (status === "published" && state.published) {
        return {text: `Published v${state.published.version} · ${timeAgo(state.published.publishedAt)}`, tone: PUBLICATION_TONE.published};
    }
    return {text: PUBLICATION_LABEL[status], tone: PUBLICATION_TONE[status]};
}

// Why Publish is unavailable, or null when it can be used.
export function publishBlocker(state: DocumentState, quota?: { left?: number, perDay?: number }): string | null {
    if (state.publish.status === "publishing") return "Publishing…";
    if (state.sync.status === "saving") return "Wait for the save to finish.";
    if (quota && quota.left === 0) return `You've used today's ${quota.perDay ?? 5} sandbox publishes.`;
    if (publicationStatus(state) === "published") return "Nothing new to publish.";
    return null;
}

// Stable attribute values for tests and agents: data-save-state / data-publish-state.
export function dataStates(state: DocumentState) {
    return {
        save: state.sync.status,
        publish: state.publish.status === "publishing" ? "publishing" : publicationStatus(state),
    };
}
