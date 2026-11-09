// Run with `npm test`. Pure transition tests for the app's state machines.
import {test} from "node:test";
import assert from "node:assert/strict";
import {
    digest,
    nextComponentState,
    stateAfterDraftSave,
    sameFingerprints,
    toPublicationStatus,
    variantFingerprints,
} from "./componentStatus";
import type {DocumentEvent, DocumentState} from "./document";
import {
    dataStates,
    documentReducer,
    hasUnsavedWork,
    initialDocument,
    publicationStatus,
    publishBlocker,
    statusLine,
    variantStatuses,
} from "./document";
import {connectionReducer, initialConnection, canSave, configKey} from "./connectionTest";

const run = (events: DocumentEvent[], from: DocumentState = initialDocument) => events.reduce(documentReducer, from);
const fp = (...pairs: [string, string][]) => pairs.map(([id, html]) => variantFingerprints([{id, name: id, content: html}])[0]);

// ------------------------------------------------------------------ component status

test("component status follows draft saves and publishes", () => {
    assert.equal(nextComponentState("new", {type: "DRAFT_SAVED"}), "new");
    assert.equal(nextComponentState("new", {type: "PUBLISHED"}), "published");
    assert.equal(nextComponentState("published", {type: "DRAFT_SAVED"}), "changed");
    assert.equal(nextComponentState("changed", {type: "DRAFT_SAVED"}), "changed");
    assert.equal(nextComponentState("changed", {type: "PUBLISHED"}), "published");
});

test("a saved draft is judged against the live version by content", () => {
    const live = variantFingerprints([{id: "a", name: "A", content: "<p>Hi</p>"}]);
    assert.equal(stateAfterDraftSave(live, null), "new");
    assert.equal(stateAfterDraftSave(variantFingerprints([{id: "a", name: "A", content: "<p>Hello</p>"}]), live), "changed");
    assert.equal(stateAfterDraftSave(variantFingerprints([{id: "a", name: "A", content: " <p>Hi</p> "}]), live), "published");
});

test("legacy and unknown stored states read as unpublished", () => {
    assert.equal(nextComponentState("staged", {type: "DRAFT_SAVED"}), "new");
    assert.equal(nextComponentState(undefined, {type: "DRAFT_SAVED"}), "new");
    assert.equal(toPublicationStatus("staged"), "unpublished");
    assert.equal(toPublicationStatus("new"), "unpublished");
    assert.equal(toPublicationStatus("changed"), "changed");
    assert.equal(toPublicationStatus("published"), "published");
});

test("fingerprints skip deleted and empty variants and respect order", () => {
    const prints = variantFingerprints([
        {id: "a", name: "A", content: "<p>One</p>"},
        {id: "b", name: "B", content: "   "},
        {id: "c", name: "C", content: "<p>Three</p>", isDeleted: true},
    ]);
    assert.deepEqual(prints.map(p => p.id), ["a"]);
    assert.equal(digest(" x "), digest("x"));
    assert.ok(!sameFingerprints(fp(["a", "1"], ["b", "2"]), fp(["b", "2"], ["a", "1"])));
    // Renaming a variant changes what the embed's variant attribute matches.
    const renamed = variantFingerprints([{id: "a", name: "Renamed", content: "<p>One</p>"}]);
    assert.ok(!sameFingerprints(prints, renamed));
});

// ------------------------------------------------------------------ document

test("an edit is unsaved until the save finishes", () => {
    const s = run([{type: "LOADED", savedAt: null, saved: [], published: null}, {type: "EDITED"}]);
    assert.equal(s.sync.status, "dirty");
    assert.equal(statusLine(s).text, "Unsaved changes");
    assert.ok(hasUnsavedWork(s));
    const saved = run([{type: "SAVE_STARTED"}, {type: "SAVE_SUCCEEDED", savedAt: "t1", saved: fp(["a", "x"])}], s);
    assert.equal(saved.sync.status, "clean");
    assert.ok(!hasUnsavedWork(saved));
});

test("an edit during a save leaves the document dirty afterwards", () => {
    const s = run([{type: "EDITED"}, {type: "SAVE_STARTED"}, {type: "EDITED"}, {type: "SAVE_SUCCEEDED", savedAt: "t1", saved: []}]);
    assert.equal(s.sync.status, "dirty");
});

test("a failed save shows an error until the next attempt", () => {
    const s = run([{type: "EDITED"}, {type: "SAVE_STARTED"}, {type: "SAVE_FAILED", message: "offline"}]);
    assert.deepEqual(s.sync, {status: "error", message: "offline"});
    assert.equal(statusLine(s).text, "Couldn’t save");
    assert.equal(run([{type: "EDITED"}], s).sync.status, "error");
    assert.equal(run([{type: "SAVE_STARTED"}], s).sync.status, "saving");
});

test("publication status compares saved content with what's live", () => {
    const live = {version: 3, publishedAt: "t0", variants: fp(["a", "<p>Hi</p>"])};
    let s = run([{type: "LOADED", savedAt: "t0", saved: fp(["a", "<p>Hi</p>"]), published: live}]);
    assert.equal(publicationStatus(s), "published");
    assert.equal(publishBlocker(s), "Nothing new to publish.");

    s = run([{type: "EDITED"}, {type: "SAVE_STARTED"}, {type: "SAVE_SUCCEEDED", savedAt: "t1", saved: fp(["a", "<p>Hello</p>"])}], s);
    assert.equal(publicationStatus(s), "changed");
    assert.equal(statusLine(s).text, "Unpublished changes");
    assert.equal(publishBlocker(s), null);

    // Undoing back to the published content is "published" again.
    s = run([{type: "EDITED"}, {type: "SAVE_STARTED"}, {type: "SAVE_SUCCEEDED", savedAt: "t2", saved: fp(["a", "<p>Hi</p>"])}], s);
    assert.equal(publicationStatus(s), "published");
});

test("a theme change is an unpublished change until the next publish", () => {
    const live = {version: 1, publishedAt: "t0", variants: fp(["a", "x"])};
    let s = run([{type: "LOADED", savedAt: "t0", saved: fp(["a", "x"]), published: live}, {type: "THEME_CHANGED"}]);
    assert.equal(publicationStatus(s), "changed");
    assert.equal(s.sync.status, "clean"); // nothing unsaved: the theme isn't part of the draft
    s = run([{type: "PUBLISH_STARTED"}, {type: "PUBLISH_SUCCEEDED", version: 2, publishedAt: "t1"}], s);
    assert.equal(publicationStatus(s), "published");
    assert.equal(s.published?.version, 2);
});

test("publishing blocks a second publish and reports its state", () => {
    let s = run([{type: "LOADED", savedAt: null, saved: fp(["a", "x"]), published: null}, {type: "PUBLISH_STARTED"}]);
    assert.equal(publishBlocker(s), "Publishing…");
    assert.equal(dataStates(s).publish, "publishing");
    s = run([{type: "PUBLISH_FAILED"}], s);
    assert.equal(dataStates(s).publish, "unpublished");
    assert.equal(publishBlocker(s), null);
});

test("visitors out of sandbox publishes can't publish", () => {
    const s = run([{type: "LOADED", savedAt: null, saved: fp(["a", "x"]), published: null}]);
    assert.match(publishBlocker(s, {left: 0, perDay: 5}) ?? "", /5 sandbox publishes/);
    assert.equal(publishBlocker(s, {left: 2, perDay: 5}), null);
});

test("variant badges reflect each variant against the live version", () => {
    const live = {version: 1, publishedAt: "t0", variants: fp(["a", "1"], ["b", "2"])};
    const s = run([{type: "LOADED", savedAt: "t1", saved: fp(["a", "1"], ["b", "changed"], ["c", "3"]), published: live}]);
    assert.deepEqual(variantStatuses(s, [{id: "a"}, {id: "b"}, {id: "c"}, {id: "d", isDeleted: true}]), {
        a: "published", b: "changed", c: "unpublished", d: "removed",
    });
});

// ------------------------------------------------------------------ connection test

test("a passed connection test only counts for the settings that were tested", () => {
    const a = configKey({endpoint: "https://a.example", kind: "rest"});
    const b = configKey({endpoint: "https://b.example", kind: "rest"});
    let s = connectionReducer(initialConnection, {type: "TEST_STARTED", key: a});
    s = connectionReducer(s, {type: "TEST_SUCCEEDED", key: a, sample: {ok: true}});
    assert.ok(canSave(s, a));
    assert.ok(!canSave(s, b)); // edited after testing
});

test("a test result for old settings is ignored", () => {
    const a = configKey({endpoint: "https://a.example"});
    const b = configKey({endpoint: "https://b.example"});
    let s = connectionReducer(initialConnection, {type: "TEST_STARTED", key: a});
    s = connectionReducer(s, {type: "TEST_STARTED", key: b}); // settings changed and re-tested
    s = connectionReducer(s, {type: "TEST_SUCCEEDED", key: a, sample: {}}); // late result for a
    assert.equal(s.status, "testing");
    assert.ok(!canSave(s, a));
});

test("saving is blocked while testing or saving", () => {
    const a = configKey({endpoint: "https://a.example"});
    let s = connectionReducer(initialConnection, {type: "TEST_STARTED", key: a});
    s = connectionReducer(s, {type: "TEST_SUCCEEDED", key: a, sample: {}});
    s = connectionReducer(s, {type: "SAVE_STARTED"});
    assert.ok(!canSave(s, a));
    s = connectionReducer(s, {type: "SAVE_FAILED"});
    assert.ok(canSave(s, a));
});
