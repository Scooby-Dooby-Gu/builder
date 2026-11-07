import {createAsyncThunk} from "@reduxjs/toolkit";
import {getQueryParam} from "../../../utils/url";
import {QueryParams, setSearch} from "../../slices/collectionsSlice";

const applySearchQueryParamAction = createAsyncThunk(
    'collections/applySearchQueryParamAction',
    async (arg, thunkAPI) => {
        const urlSearch = getQueryParam({key: QueryParams.SEARCH});

        if (urlSearch) {
            thunkAPI.dispatch(setSearch(urlSearch));
        }
    }
)

export default applySearchQueryParamAction;