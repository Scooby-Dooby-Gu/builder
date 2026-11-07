import {createAsyncThunk} from "@reduxjs/toolkit";
import * as Actions from "../../slices/collectionsSlice";
import * as API from "../../../utils/api";
import {deleteComponent, filter, filterAndSort, sort} from "../../slices/collectionsSlice";

export const deleteComponentAction = createAsyncThunk(
    'collections/deleteComponentAction',
    async (arg: { id: string, collectionId: string }, thunkAPI) => {
        const {dispatch} = thunkAPI;

        const {id, collectionId} = arg;

        try {
            const component = await API.deleteComponent(id, collectionId);

            dispatch(deleteComponent(component));

            dispatch(filterAndSort());
        } catch (error) {
            // Handle error
        }
    }
)

export default deleteComponentAction;