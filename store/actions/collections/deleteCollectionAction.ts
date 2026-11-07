import {createAsyncThunk} from "@reduxjs/toolkit";
import * as Actions from "../../slices/collectionsSlice";
import * as API from "../../../utils/api";
import {deleteCollection, deleteComponent, filter, filterAndSort, sort} from "../../slices/collectionsSlice";

export const deleteCollectionAction = createAsyncThunk(
    'collections/deleteCollectionAction',
    async (arg: { id: string }, thunkAPI) => {
        const {dispatch} = thunkAPI;

        const {id} = arg;

        try {
            const collection = await API.deleteCollection(id);

            dispatch(deleteCollection(collection));

            dispatch(filterAndSort());
        } catch (error) {
            // Handle error
        }
    }
)

export default deleteCollectionAction;