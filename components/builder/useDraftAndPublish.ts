import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "store/hooks";
import {documentEvent} from "store/slices/builderSlice";
import {setPublishesLeft} from "store/slices/sessionSlice";
import {publishComponent, saveComponentDraft} from "utils/api";
import {buildSnapshot} from "lib/publish";
import {hasUnsavedWork} from "lib/machines/document";
import {variantFingerprints} from "lib/machines/componentStatus";
import {ComponentVariant} from "models/builder";

const SAVE_DELAY_MS = 800;

// Autosaves the component's draft as you edit, and publishes it on request.
// Content lives in the editor (one root per variant), so it's read from there.
// State changes go through the document machine (lib/machines/document.ts).
export function useDraftAndPublish(editor: any) {
    const dispatch = useAppDispatch();
    const componentId = useAppSelector((state) => state.builder.componentId);
    const variants = useAppSelector((state) => state.builder.variants);
    const document = useAppSelector((state) => state.builder.document);
    const system = useAppSelector((state) => state.styles.system);
    const themeId = useAppSelector((state) => componentId ? state.styles.componentThemes[componentId] : undefined);
    const datasources = useAppSelector((state) => state.datasources);

    const latestVariants = useRef(variants);
    latestVariants.current = variants;
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const collect = useCallback((): ComponentVariant[] => latestVariants.current.map((variant) => {
        const hasRoot = editor && editor.model.document.getRootNames().includes(variant.id);
        return {...variant, content: hasRoot ? editor.getData({rootName: variant.id}) : variant.content};
    }), [editor]);

    const saveNow = useCallback(async () => {
        if (!componentId || !editor) return null;
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        const current = collect();
        dispatch(documentEvent({type: "SAVE_STARTED"}));
        try {
            const {updatedAt} = await saveComponentDraft(componentId, current);
            dispatch(documentEvent({type: "SAVE_SUCCEEDED", savedAt: updatedAt, saved: variantFingerprints(current)}));
            return current;
        } catch (error) {
            dispatch(documentEvent({type: "SAVE_FAILED", message: (error as Error).message}));
            throw error;
        }
    }, [componentId, editor, collect, dispatch]);

    const edited = useCallback(() => {
        dispatch(documentEvent({type: "EDITED"}));
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            saveNow().catch(() => undefined);
        }, SAVE_DELAY_MS);
    }, [saveNow, dispatch]);

    // Edits inside the editor. Only undoable batches are user edits; loading content
    // and the data preview also change the model but shouldn't create a draft.
    useEffect(() => {
        if (!editor) return;
        const onChange = (evt: unknown, batch: any) => {
            if (batch && batch.isUndoable) edited();
        };
        editor.model.document.on("change:data", onChange);
        return () => editor.model.document.off("change:data", onChange);
    }, [editor, edited]);

    // Variant changes from the canvas: add, duplicate, delete, restore, reorder.
    // Compare against the previous list: this effect also re-runs when the editor
    // finishes starting, which must not count as an edit (it used to autosave, and
    // mark published components as changed, just by opening them).
    const previousVariants = useRef(variants);
    useEffect(() => {
        if (previousVariants.current === variants) return;
        previousVariants.current = variants;
        if (editor) edited();
    }, [variants, editor, edited]);

    // The theme is applied when publishing, so changing it is an unpublished change
    // (not an unsaved one: the theme choice is stored with the style guide).
    const isFirstTheme = useRef(true);
    useEffect(() => {
        if (isFirstTheme.current) {
            isFirstTheme.current = false;
            return;
        }
        dispatch(documentEvent({type: "THEME_CHANGED"}));
    }, [themeId, dispatch]);

    // Save anything pending when leaving the page within the app.
    useEffect(() => () => {
        if (timer.current) {
            clearTimeout(timer.current);
            saveNow().catch(() => undefined);
        }
    }, [saveNow]);

    // Closing the tab or reloading can't wait for a save, so ask first.
    const unsaved = hasUnsavedWork(document);
    useEffect(() => {
        if (!unsaved) return;
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [unsaved]);

    const publish = useCallback(async () => {
        if (!componentId) throw new Error("No component loaded.");
        dispatch(documentEvent({type: "PUBLISH_STARTED"}));
        try {
            const current = (await saveNow()) ?? collect();
            const snapshot = buildSnapshot({
                variants: current.map((v) => ({...v, html: v.content})),
                system,
                themeId,
                datasources,
            });
            if (!snapshot.variants.length) {
                throw new Error("There's nothing to publish yet. Add content to a variant first.");
            }
            const result = await publishComponent(componentId, snapshot);
            dispatch(documentEvent({type: "PUBLISH_SUCCEEDED", version: result.version, publishedAt: result.publishedAt}));
            dispatch(setPublishesLeft(result.publishesLeft));
            return result;
        } catch (error) {
            dispatch(documentEvent({type: "PUBLISH_FAILED"}));
            throw error;
        }
    }, [componentId, saveNow, collect, system, themeId, datasources, dispatch]);

    return {saveNow, publish};
}
