import {useCallback, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "store/hooks";
import {setPublished, setSaveStatus} from "store/slices/builderSlice";
import {setPublishesLeft} from "store/slices/sessionSlice";
import {publishComponent, saveComponentDraft} from "utils/api";
import {buildSnapshot} from "lib/publish";
import {ComponentVariant} from "models/builder";

const SAVE_DELAY_MS = 800;

// Autosaves the component's draft as you edit, and publishes it on request.
// Content lives in the editor (one root per variant), so it's read from there.
export function useDraftAndPublish(editor: any) {
    const dispatch = useAppDispatch();
    const componentId = useAppSelector((state) => state.builder.componentId);
    const variants = useAppSelector((state) => state.builder.variants);
    const builderStyles = useAppSelector((state) => state.builder.styles);
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
        dispatch(setSaveStatus({status: "saving"}));
        try {
            const {updatedAt} = await saveComponentDraft(componentId, current);
            dispatch(setSaveStatus({status: "saved", savedAt: updatedAt}));
            return current;
        } catch (error) {
            dispatch(setSaveStatus({status: "error"}));
            throw error;
        }
    }, [componentId, editor, collect, dispatch]);

    const scheduleSave = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            saveNow().catch(() => undefined);
        }, SAVE_DELAY_MS);
    }, [saveNow]);

    // Edits inside the editor. Only undoable batches are user edits; loading content
    // and the data preview also change the model but shouldn't create a draft.
    useEffect(() => {
        if (!editor) return;
        const onChange = (evt: unknown, batch: any) => {
            if (batch && batch.isUndoable) scheduleSave();
        };
        editor.model.document.on("change:data", onChange);
        return () => editor.model.document.off("change:data", onChange);
    }, [editor, scheduleSave]);

    // Variant changes from the canvas: add, duplicate, delete, restore, reorder.
    const isFirstVariants = useRef(true);
    useEffect(() => {
        if (isFirstVariants.current) {
            isFirstVariants.current = false;
            return;
        }
        if (editor) scheduleSave();
    }, [variants, editor, scheduleSave]);

    // The theme is part of what gets published, so changing it leaves unpublished changes.
    const isFirstTheme = useRef(true);
    useEffect(() => {
        if (isFirstTheme.current) {
            isFirstTheme.current = false;
            return;
        }
        dispatch(setSaveStatus({status: "saved", savedAt: new Date().toISOString()}));
    }, [themeId, dispatch]);

    // Save anything pending when leaving the page.
    useEffect(() => () => {
        if (timer.current) {
            clearTimeout(timer.current);
            saveNow().catch(() => undefined);
        }
    }, [saveNow]);

    const publish = useCallback(async () => {
        if (!componentId) throw new Error("No component loaded.");
        const current = (await saveNow()) ?? collect();
        const snapshot = buildSnapshot({
            variants: current.map((v) => ({...v, html: v.content})),
            system,
            themeId,
            datasources,
            builderStyles,
        });
        if (!snapshot.variants.length) {
            throw new Error("There's nothing to publish yet. Add content to a variant first.");
        }
        const result = await publishComponent(componentId, snapshot);
        dispatch(setPublished({version: result.version, publishedAt: result.publishedAt}));
        dispatch(setPublishesLeft(result.publishesLeft));
        return result;
    }, [componentId, saveNow, collect, system, themeId, datasources, builderStyles, dispatch]);

    return {saveNow, publish};
}
