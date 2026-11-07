import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../../store";
import {createCollection, filter, filterAndSort, sort} from "../../slices/collectionsSlice";
import * as API from "../../../utils/api";

export const createCollectionAction = createAsyncThunk(
    'collections/createCollectionAction',
    async (_, thunkAPI) => {
        const {dispatch, getState} = thunkAPI;

        const {title} = (getState() as RootState).collections.editableCollection;

        try {
            const collection = await API.createCollection(title);

            dispatch(createCollection(collection));

            dispatch(filterAndSort());
        } catch (error) {
            // Handle error
        }
    }
)

export default createCollectionAction;