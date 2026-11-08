import {configureStore} from "@reduxjs/toolkit";
import CollectionsReducer from "./slices/collectionsSlice";
import BuilderReducer from "./slices/builderSlice";
import DatasourcesReducer from "./slices/datasourcesSlice";
import StylesSlice, {STORAGE_KEY} from "./slices/stylesSlice";
import SessionReducer from "./slices/sessionSlice";

const store = configureStore({
    reducer: {
        collections: CollectionsReducer,
        builder: BuilderReducer,
        datasources: DatasourcesReducer,
        styles: StylesSlice,
        session: SessionReducer
    },
})

// Keep the style guide and theme choices between visits. Only writes when they change.
if (typeof window !== "undefined") {
    let lastStyles = store.getState().styles;
    store.subscribe(() => {
        const styles = store.getState().styles;
        if (styles === lastStyles) return;
        lastStyles = styles;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
        } catch {
            // Storage can be full or disabled; the guide still works for this visit.
        }
    });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;