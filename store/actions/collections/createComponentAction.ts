import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "../../store";
import {createComponent, filter, filterAndSort, sort} from "../../slices/collectionsSlice";
import * as API from "../../../utils/api";

export const createComponentAction = createAsyncThunk(
    'collections/createComponentAction',
    async (_, thunkAPI) => {
        const {dispatch, getState} = thunkAPI;

        const {name, collectionId, description} = (getState() as RootState).collections.editableComponent;

        try {
            const component = await API.createComponent(name, collectionId, description);

            dispatch(createComponent(component));

            dispatch(filterAndSort());
        } catch (error) {
            // Handle error
        }
    }
)

export default createComponentAction;