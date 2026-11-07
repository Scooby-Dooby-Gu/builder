import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../../store";
import {filter, filterAndSort, sort, updateCollection} from "../../slices/collectionsSlice";
import * as API from "../../../utils/api";

export const updateCollectionAction = createAsyncThunk(
    'collections/updateCollection',
    async (_, thunkAPI) => {
        const {dispatch, getState} = thunkAPI;

        const {id, title} = (getState() as RootState).collections.editableCollection;

        try {
            const collection = await API.updateCollection(title, id);

            dispatch(updateCollection(collection));

            dispatch(filterAndSort());
        } catch (error) {
            // Handle error
        }
    }
)

export default updateCollectionAction;