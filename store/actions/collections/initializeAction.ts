import {createAsyncThunk} from "@reduxjs/toolkit";
import fetchCollectionsAction from "./fetchCollectionsAction";
import {filter, filterAndSort, sort,} from "../../slices/collectionsSlice";
import applySearchQueryParamAction from "./applySearchQueryParamAction";
import applyDatasourcesQueryParamAction from "./applyDatasourcesQueryParamAction";
import applySortQueryParamAction from "./applySortQueryParamAction";

const initializeAction = createAsyncThunk(
    'collections/initialize',
    async (arg, thunkAPI) => {
        const {dispatch} = thunkAPI;

        await dispatch(fetchCollectionsAction());

        dispatch(applySearchQueryParamAction());
        dispatch(applyDatasourcesQueryParamAction());
        dispatch(applySortQueryParamAction());

        dispatch(filterAndSort());
    }
)

export default initializeAction;