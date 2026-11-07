import {createAsyncThunk} from "@reduxjs/toolkit";
import {getQueryParam} from "../../../utils/url";
import {QueryParams, setSortBy, SortBy} from "../../slices/collectionsSlice";

const applySortQueryParamAction = createAsyncThunk(
    'collections/applySortQueryParamAction',
    async (arg, thunkAPI) => {
        const urlSort = getQueryParam({key: QueryParams.SORT});

        if (urlSort) {
            thunkAPI.dispatch(setSortBy(urlSort as SortBy));

            return;
        }

        thunkAPI.dispatch(setSortBy(SortBy.PUBLISHED));
    }
)

export default applySortQueryParamAction;