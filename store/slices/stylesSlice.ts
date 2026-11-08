import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {v4 as uuidv4} from "uuid";
import {DEFAULT_SYSTEM, newItem, StyleSystem, TokenKind, usagesOf, withMissingLayers} from "utils/styleSystem";

export const STORAGE_KEY = "builder.styleSystem.v1";

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

export interface StylesState {
    system: StyleSystem,
    // Which theme each component in the builder uses, by component id.
    componentThemes: Record<string, string>,
    presetVersion: number,
}

const THEME_PRESET_VERSION = 1;

function addBundledThemeTokens(system: StyleSystem): StyleSystem {
    const next = clone(system);
    (Object.keys(DEFAULT_SYSTEM) as TokenKind[]).forEach(kind => {
        const current = next[kind] as {id: string}[];
        const existing = new Set(current.map(item => item.id));
        const bundled = (DEFAULT_SYSTEM[kind] as {id: string}[]).filter(item => item.id.startsWith("tp-"));
        (next[kind] as any[]).push(...bundled.filter(item => !existing.has(item.id)).map(clone));
    });
    return next;
}

function loadSaved(): StylesState {
    try {
        if (typeof window !== "undefined") {
            const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
            const system = withMissingLayers(saved?.system);
            if (system) {
                const presetVersion = Number(saved.presetVersion) || 0;
                const loaded = {
                    system: presetVersion < THEME_PRESET_VERSION ? addBundledThemeTokens(system) : system,
                    componentThemes: saved.componentThemes ?? {},
                    presetVersion: THEME_PRESET_VERSION,
                };
                if (presetVersion < THEME_PRESET_VERSION) {
                    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded)); } catch { /* Keep the in-memory themes if storage is unavailable. */ }
                }
                return loaded;
            }
        }
    } catch {
        // Ignore unreadable saved state and fall back to defaults.
    }
    return {system: clone(DEFAULT_SYSTEM), componentThemes: {}, presetVersion: THEME_PRESET_VERSION};
}

const initialState: StylesState = loadSaved();

export const stylesSlice = createSlice({
    name: "styles",
    initialState,
    reducers: {
        addItem: {
            reducer(state, action: PayloadAction<{ kind: TokenKind, id: string }>) {
                const {kind, id} = action.payload;
                (state.system[kind] as any[]).push(newItem(kind, id, state.system as StyleSystem));
            },
            // The id is created here so the caller can open the new item right away.
            prepare(kind: TokenKind) {
                return {payload: {kind, id: uuidv4()}};
            },
        },
        updateItem(state, action: PayloadAction<{ kind: TokenKind, id: string, patch: Record<string, any> }>) {
            const {kind, id, patch} = action.payload;
            const item = (state.system[kind] as any[]).find(i => i.id === id);
            if (item) Object.assign(item, patch);
        },
        removeItem(state, action: PayloadAction<{ kind: TokenKind, id: string }>) {
            const {kind, id} = action.payload;
            // Items still referenced by another layer, or themes applied to a component, can't be removed.
            if (usagesOf(state.system as StyleSystem, kind, id).length) return;
            if (kind === "themes" && Object.values(state.componentThemes).includes(id)) return;
            (state.system as any)[kind] = (state.system[kind] as any[]).filter(i => i.id !== id);
        },
        resetSystem(state) {
            state.system = clone(DEFAULT_SYSTEM);
            state.componentThemes = {};
        },
        setComponentTheme(state, action: PayloadAction<{ componentId: string, themeId: string | null }>) {
            const {componentId, themeId} = action.payload;
            if (themeId) state.componentThemes[componentId] = themeId;
            else delete state.componentThemes[componentId];
        },
    },
});

export const {addItem, updateItem, removeItem, resetSystem, setComponentTheme} = stylesSlice.actions;

export default stylesSlice.reducer;
