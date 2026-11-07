import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../../store";
import {filter, filterAndSort, sort, updateComponent} from "../../slices/collectionsSlice";
import * as API from "../../../utils/api";

export const updateComponentAction = createAsyncThunk(
    'collections/updateComponentAction',
    async (_, thunkAPI) => {
        const {dispatch, getState} = thunkAPI;

        const {id, name, collectionId, description} = (getState() as RootState).collections.editableComponent;

        try {
            const component = await API.updateComponent(id, name, collectionId, description);

            dispatch(updateComponent(component));

            dispatch(filterAndSort());
        } catch (error) {
            // Handle error
        }
    }
)

export default updateComponentAction;