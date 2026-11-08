import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../../store";
import * as API from "../../../utils/api";
import {buildSnapshot} from "../../../lib/publish";
import {SEED_VARIANTS} from "../../slices/builderSlice";
import fetchCollections from "./fetchCollectionsAction";
import {filterAndSort} from "../../slices/collectionsSlice";
import {setPublishesLeft} from "../../slices/sessionSlice";

// Publish components from the library, without opening the builder: uses each
// component's saved draft (or the starter content) and its theme.
const publishComponents = createAsyncThunk(
    'collections/publishComponents',
    async (arg: { ids: string[] }, thunkAPI) => {
        const state = thunkAPI.getState() as RootState;
        const results: { id: string, version?: number, error?: string }[] = [];

        for (const id of arg.ids) {
            try {
                const {draft} = await API.fetchComponentDraft(id);
                const variants = draft?.variants?.length ? draft.variants : SEED_VARIANTS;
                const snapshot = buildSnapshot({
                    variants: variants.map((v) => ({...v, html: v.content})),
                    system: state.styles.system,
                    themeId: state.styles.componentThemes[id],
                    datasources: state.datasources,
                });
                if (!snapshot.variants.length) throw new Error("It has no content yet.");
                const {version, publishesLeft} = await API.publishComponent(id, snapshot);
                thunkAPI.dispatch(setPublishesLeft(publishesLeft));
                results.push({id, version});
            } catch (error) {
                results.push({id, error: (error as Error).message});
            }
        }

        await thunkAPI.dispatch(fetchCollections());
        thunkAPI.dispatch(filterAndSort());
        return results;
    }
)

export default publishComponents;
