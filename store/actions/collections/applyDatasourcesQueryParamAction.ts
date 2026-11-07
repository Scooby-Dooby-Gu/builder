import {createAsyncThunk} from "@reduxjs/toolkit";
import {getQueryParam} from "../../../utils/url";
import {QueryParams, setSelectedDataSources} from "../../slices/collectionsSlice";
import {RootState} from "../../store";

const applyDatasourcesQueryParamAction = createAsyncThunk(
    'collections/applyDatasourcesQueryParamAction',
    async (arg, thunkAPI) => {
        const {dispatch, getState} = thunkAPI;
        const datasources = (getState() as RootState).datasources;

        const urlDatasources = getQueryParam({key: QueryParams.DATA_SOURCES});

        if (urlDatasources) {
            dispatch(setSelectedDataSources(urlDatasources
                .split(",")
                .map(id => datasources.find(ds => ds.id.toString() === id.toString())))
            )
        }
    }
)

export default applyDatasourcesQueryParamAction;