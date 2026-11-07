import {configureStore} from "@reduxjs/toolkit";
import CollectionsReducer from "./slices/collectionsSlice";
import BuilderReducer from "./slices/builderSlice";
import DatasourcesReducer from "./slices/datasourcesSlice";
import StylesSlice from "./slices/stylesSlice";

const store = configureStore({
    reducer: {
        collections: CollectionsReducer,
        builder: BuilderReducer,
        datasources: DatasourcesReducer,
        styles: StylesSlice
    },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;